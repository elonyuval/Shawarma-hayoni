# שווארמה עיוני — אתר

אתר סטטי, RTL, Mobile First. בלי build, בלי dependencies, בלי framework —
HTML + CSS + JavaScript רגיל. פותחים קובץ ועורכים.

```
index.html            — כל המבנה של הדף
assets/css/style.css  — כל העיצוב (מחולק לסקשנים ממוספרים)
assets/js/data.js     — ⬅ כל המידע העסקי. זה הקובץ שאתה עורך.
assets/js/main.js     — לוגיקה: אנימציות, תפריט, אינטראקציות
images/               — כל התמונות (ראה images/README.md)
favicon.svg           — אייקון זמני
```

## הרצה מקומית

```bash
python3 -m http.server 8000
# ואז לפתוח http://localhost:8000
```

(צריך שרת ולא פתיחה ישירה של הקובץ, כי הנתיבים באתר מוחלטים — `/assets/...`)

## מה צריך להחליף לפני עלייה לאוויר

הכול מרוכז ב־`assets/js/data.js`. חפש שם `PLACEHOLDER`:

- [ ] טלפון (`contact.phoneDisplay` + `contact.phoneTel`)
- [ ] כתובת מדויקת (`contact.addressLine`)
- [ ] שעות פעילות (`hours`)
- [ ] קישור להזמנה / משלוחים (`links.order`)
- [ ] קישורי Waze / Google Maps האמיתיים (`links.waze`, `links.googleMaps`)
- [ ] אינסטגרם / פייסבוק (`links.instagram`, `links.facebook`) — אם ריק, לא יוצג
- [ ] דירוג ומספר ביקורות בגוגל (`rating`)
- [ ] **3 ביקורות אמיתיות** (`reviews`) — כרגע מסומנות בבירור כ־placeholder באתר
- [ ] גוף הכשרות (`brand.kosherAuthority`)
- [ ] טקסט "על עיוני" (`about.paragraphs`)
- [ ] מפה: להדביק `src` של Google Maps embed ב־`mapEmbedSrc`
- [ ] קואורדינטות ל־SEO (`geo`)

וב־`index.html`:

- [ ] `https://example.com/` → הדומיין האמיתי (canonical + og:url + robots.txt + sitemap.xml)

תמונות — לפי `images/README.md`.

## דברים שכדאי לדעת

- **תמונות:** כל תמונה חסרה מוצגת כ־placeholder מעוצב עם שם הקובץ. ברגע שהקובץ קיים
  הוא נטען ומחליף את ה־placeholder. אין צורך לשנות קוד.
- **קישור ריק** ב־`links` פשוט לא יוצג (רשתות חברתיות, ביקורות).
- **אנימציות** מכבדות `prefers-reduced-motion`.
- **structured data** (Restaurant) נבנה אוטומטית מתוך `data.js` — אין כפילות מידע.
