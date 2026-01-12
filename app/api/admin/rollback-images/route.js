import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

export async function GET() {
    try {
        const batch = adminDb.batch();
        const updates = [
            { id: "0pSonbzCqu6EUyBizza6", logo: "https://www.kalerkantho.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.ff912e57.png&w=640&q=75" },
            { id: "4ChEgVYZ0aNZVsp29kCo", logo: "https://backend.enayadiganta.com/assets/uploads/logo.png" },
            { id: "4db1Uh6LSgREOFmyHU1i", logo: "https://sharebiz.net/wp-content/themes/jnews/assets/img/logo.png" },
            { id: "AZuP2qT1z9HIJNYO0z9i", logo: "https://static.dailysangram.com/images/DailySangram-Logo-en-H90_nmRtezH.original.png" },
            { id: "CYpSzFmAAPBCnsuHt3Xd", logo: "https://epaper.observerbd.com/img/logo-epaper.jpg" },
            { id: "DoIi7WxkBPpU3ooPWVWq", logo: "https://www.dailyjanakantha.com/media/common/janakantha-logo-jpg-5.jpg" },
            { id: "EPyBw437s1HXmqOo0Bz5", logo: "https://cdn.ittefaqbd.com/contents/themes/public/style/images/logo.svg" },
            { id: "FtYfGNbXV0OR97yD4elx", logo: "https://dainikamadershomoy.com/_nuxt/dainik-amader-shomoy.7d108dd.png" },
            { id: "L0Ym0BfsrnMQR50mlgCW", logo: "https://samakal.com/frontend/media/common/logo.png" },
            { id: "L7XVQ9XGuQiQaaGUReIR", logo: "https://samakal.com/frontend/media/common/logo.png" },
            { id: "MOtPSxhTHKdw24neuHvt", logo: "https://cdn.jugantor.com/uploads/settings/logo-black.png" },
            { id: "QG4b34z4CQEUcsX153Pq", logo: "https://www.bhorerkagoj.net/uploads/settings/logo-black.png" },
            { id: "Qq5xqgHRyzcA4YoSKBMA", logo: "https://res.cloudinary.com/dttj4hfgx/image/upload/v1766558729/e2zswk8kmymt9syrtjbg.webp" },
            { id: "SwWt5ZBANSBOWKJCKCbY", logo: "https://res.cloudinary.com/dttj4hfgx/image/upload/v1766766185/ujcwlryiji1ntzlybduf.webp" },
            { id: "TMGvTnD4qzQuYctr7gmy", logo: "https://www.alokitobangladesh.com/templates/desktop-v1/images/logo.png" },
            { id: "U8CtWR411QQaeBaRuc0l", logo: "https://cdn.deshrupantor.net/contents/themes/public/style/images/logo.svg" },
            { id: "UpXGnyZ7bKgFo3Oyh8dW", logo: "https://ajkalerkhobor.net/images/logo.jpg" },
            { id: "WgmvCGrd9g1SoBXQUnJq", logo: "https://media.dailynayadiganta.com/original_images/ND-logo-beta.png" },
            { id: "ZkzH0sQe2ihOpF98Esyk", logo: "https://epaper.bhorerkagoj.net/epaper/img/logo.png" },
            { id: "eDFmv7vdUhcTsUA0B1dS", logo: "https://res.cloudinary.com/dttj4hfgx/image/upload/v1766558124/tyrh1dih1c1bepyln27a.webp" },
            { id: "fstWs2bb4VkNsMRx8TLw", logo: "https://ecdn.dhakatribune.net/contents/themes/public/style/images/logo-en2.png" },
            { id: "gphCsKjiVj6WspHDYHzj", logo: "https://www.kalerkantho.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.ff912e57.png&w=640&q=75" },
            { id: "lIC96fUYFXx8cuWic4Zy", logo: "https://www.bangladesherkhabor.net/uploads/settings/BK-NEW-LOGO-BLACKlogo-1-1761163905.png" },
            { id: "o0dcd7z2PYSePIJY8j70", logo: "https://www.kholakagojbd.com/images/logo.png" },
            { id: "r4g48IuMkSFD6KFEFu9J", logo: "https://www.thedailystar.net/sites/all/themes/sloth/logo.svg" },
            { id: "s1qxqk1EDho6xGitA86S", logo: "https://epaper.bonikbarta.com/sites/all/themes/sloth/ebonik.png" },
            { id: "ttGMrZfhiPK0TVnhlCeB", logo: "https://cdn.ittefaqbd.com/contents/themes/public/style/images/logo.svg" },
            // Revert E-Prothom Alo as well, just in case
            { id: "TK7dsjLGRCW7zZxBWOEg", logo: "https://media.prothomalo.com/prothomalo-bangla/2025-11-17/qix5skks/palo-bangla.svg" }
        ];

        updates.forEach(u => {
            const ref = adminDb.collection("newspapers").doc(u.id);
            batch.update(ref, { logo: u.logo });
        });

        await batch.commit();

        return NextResponse.json({ success: true, count: updates.length, message: "Rollback successful" });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
