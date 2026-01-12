import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const shouldFix = searchParams.get('fix') === 'true';

        const snap = await adminDb.collection("newspapers").get();
        const updates = [];
        const missing = [];
        const present = [];

        const publicDir = path.join(process.cwd(), 'public');
        const localFiles = fs.readdirSync(path.join(publicDir, 'newspapers'));

        snap.docs.forEach(doc => {
            const data = doc.data();
            const currentLogo = data.logo || "";

            // Check if current logo exists locally
            let exists = false;
            if (currentLogo.startsWith('/newspapers/')) {
                const filename = currentLogo.replace('/newspapers/', '');
                if (localFiles.includes(filename)) exists = true;
            }

            if (exists) {
                present.push(data.name);
                return;
            }

            // It's missing or remote. Try to find a match.
            let matchedFile = null;
            let domain = "";
            let domainParts = [];
            try {
                const urlObj = new URL(data.url);
                const hostname = urlObj.hostname;
                // Split by dot and filter common prefixes/suffixes
                domainParts = hostname.split('.').filter(p => !['www', 'm', 'e', 'epaper', 'com', 'net', 'org', 'bd'].includes(p));

            } catch (e) { }

            matchedFile = localFiles.find(f => {
                const fName = f.toLowerCase();
                const fBase = fName.split('.')[0].replace(/_com$/, '').replace(/_net$/, '').replace(/_bd$/, ''); // Remove common file suffixes for cleaner match

                // Strategy 1: Check if any significant domain part matches file
                for (const part of domainParts) {
                    if (part.length < 3) continue; // Skip short parts
                    if (fBase.includes(part) || part.includes(fBase)) return true;
                }

                // Strategy 2: Check Name
                if (data.name) {
                    const cleanName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanFBase = fBase.replace(/[^a-z0-9]/g, '');
                    if (cleanFBase.includes(cleanName) || cleanName.includes(cleanFBase)) return true;
                }

                return false;
            });

            if (matchedFile) {
                updates.push({
                    id: doc.id,
                    name: data.name,
                    oldLogo: currentLogo,
                    newLogo: `/newspapers/${matchedFile}`,
                    matchMethod: 'fuzzy_v2',
                    file: matchedFile
                });
            } else {
                missing.push({
                    id: doc.id,
                    name: data.name,
                    url: data.url,
                    currentLogo: currentLogo
                });
            }
        });

        let committed = false;
        if (shouldFix && updates.length > 0) {
            const batch = adminDb.batch();
            updates.forEach(u => {
                const ref = adminDb.collection("newspapers").doc(u.id);
                batch.update(ref, { logo: u.newLogo });
            });
            await batch.commit();
            committed = true;
        }

        return NextResponse.json({
            success: true,
            mode: shouldFix ? 'FIX' : 'DRY_RUN',
            committed,
            updates_count: updates.length,
            missing_count: missing.length,
            updates,
            missing,
            local_files: localFiles
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
