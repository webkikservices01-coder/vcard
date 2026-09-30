# "Get my card" – Pay → Delivered on WhatsApp: setup guide

The flow is built and switched off until the keys below are added. Nothing changes for existing
plans (Cashfree). Backend URL used below: `https://backend-nine-omega-26.vercel.app`.

## How it works

1. The signed-in user opens **Dashboard → Get my card**, confirms their WhatsApp number and taps **Get my card – Pay ₹999**.
2. The backend creates an order (`PENDING_PAYMENT`, expires in 24 h) and a Razorpay Payment Link with `expire_by` = 24 h.
3. The link goes out at once by email and WhatsApp (`payment_link_template`).
4. After payment, Razorpay calls the webhook. The order becomes `PAID` (only once, even if Razorpay repeats the call). The card PDF (+ image) is sent on WhatsApp (`card_delivery_template`, up to 3 tries) and by email. The dashboard shows **Download card**.
5. If WhatsApp still fails after 3 tries, the order shows `FAILED` with the reason, and a **Resend** button appears for the user and in **Admin → Card orders**.
6. After 24 h the link stops working, the order becomes `EXPIRED`, and the dashboard shows **Generate new payment link**. 2 hours before expiry a reminder goes out (`payment_reminder_template`).

## 1. Razorpay

1. Sign in at https://dashboard.razorpay.com. Switch to **Test Mode** (top bar) for sandbox testing.
2. **Account & Settings → API Keys → Generate Key**. Copy the Key ID (`rzp_test_…`) and Key Secret.
3. **Account & Settings → Webhooks → Add New Webhook**:
   - Webhook URL: `https://backend-nine-omega-26.vercel.app/api/webhooks/razorpay`
   - Secret: type a long random string and keep it
   - Active events: `payment_link.paid`, `payment_link.expired`, `payment_link.cancelled`, `payment.captured`
4. Add in Vercel (backend project → Settings → Environment Variables → Production):

   | Key | Value |
   |---|---|
   | `RAZORPAY_KEY_ID` | Key ID |
   | `RAZORPAY_KEY_SECRET` | Key Secret |
   | `RAZORPAY_WEBHOOK_SECRET` | the webhook secret from step 3 |
   | `CARD_PRICE_INR` | `999` |

5. For live payments later: complete Razorpay KYC, switch to **Live Mode**, generate live keys, add the webhook again in Live Mode, and replace the three values.

## 2. WhatsApp Business Cloud API (number +91 98686 98698)

> **Important:** a number on the Cloud API can't be used in the normal WhatsApp / WhatsApp Business app at the same time, unless Meta offers you **Coexistence** (onboarding a WhatsApp Business app number, available in India). Check that before moving +91 98686 98698, or use a second number.

1. Create a Meta Business account (https://business.facebook.com) and verify the business (Webkik Services).
2. https://developers.facebook.com → **My Apps → Create App → Business** → add the **WhatsApp** product.
3. **WhatsApp → API Setup → Add phone number** → +91 98686 98698, display name "Aicardly", verify by SMS/call. Copy the **Phone number ID**.
4. Permanent token: **Business Settings → Users → System users → Add** (Admin) → **Add assets** (the app, full control) → **Generate token** with `whatsapp_business_messaging` and `whatsapp_business_management`. Copy the token.
5. **App Settings → Basic → App secret** → copy.
6. **WhatsApp → Configuration → Webhook → Edit**:
   - Callback URL: `https://backend-nine-omega-26.vercel.app/api/webhooks/whatsapp`
   - Verify token: any string you choose (same as `WHATSAPP_VERIFY_TOKEN` below)
   - Then **Manage → subscribe to `messages`**.
7. Add a payment method in WhatsApp Manager (template messages are billed per conversation).
8. Add in Vercel:

   | Key | Value |
   |---|---|
   | `WHATSAPP_TOKEN` | permanent system-user token |
   | `WHATSAPP_PHONE_NUMBER_ID` | phone number ID |
   | `WHATSAPP_APP_SECRET` | app secret |
   | `WHATSAPP_VERIFY_TOKEN` | your verify string |
   | `WA_TEMPLATE_LANG` | `en` |

### Templates to submit (WhatsApp Manager → Message templates → Create)

Category **Utility**, language **English (en)**. Names must match exactly (or change the `WA_TEMPLATE_*` variables).

**`payment_link_template`** – body:
```
Hi {{1}}, your Aicardly digital card is ready! 🎉

Pay ₹{{2}} to receive it on WhatsApp and email:
{{3}}

This link is valid for 24 hours.
```
Samples: `Shubham`, `999`, `https://rzp.io/i/abc123`

**`card_delivery_template`** – header: **Document**. Body:
```
Hi {{1}}, thank you for your payment! 🎉 Your Aicardly card is attached as a PDF.

Your live card: {{2}}

Save it and share it anywhere.
```
Samples: header = any PDF, `Shubham`, `https://aicardly.com/shubham-khurana`

**`payment_reminder_template`** (optional) – body:
```
Hi {{1}}, your Aicardly payment link expires in about 2 hours. Complete your payment here: {{2}}

Need help? Just reply to this message.
```
Samples: `Shubham`, `https://rzp.io/i/abc123`

Approval usually takes minutes to a few hours.

## 3. Scheduled job (every 10 minutes)

The job expires old links, sends the 2-hour reminders and finishes any delivery that got stuck.

1. Add `CRON_SECRET` (a long random string) in Vercel.
2. Vercel runs it once a day (in `vercel.json`). For every 10 minutes, create a free job at https://cron-job.org:
   - URL: `https://backend-nine-omega-26.vercel.app/api/cron/card-orders?key=<CRON_SECRET>`
   - Schedule: every 10 minutes, method GET.

Expiry also happens by itself whenever an order is opened, so the job is mainly for reminders.

## 4. Deploy

After adding the variables: Vercel → backend → **Deployments → ⋯ → Redeploy**. Upload the new frontend zip to Hostinger.

## 5. Test in sandbox (Razorpay Test Mode)

1. Sign up with your email and WhatsApp number, verify the email, create your card.
2. **Dashboard → Get my card** → **Pay ₹999**. You should get the email ("Complete your payment – your card is ready") and the WhatsApp message.
3. Open the link, pay with a Razorpay test method: UPI `success@razorpay`, or card `4111 1111 1111 1111`, any future expiry, any CVV, OTP `1234`.
4. You return to the dashboard: "Payment received! Sending your card…", then the PDF arrives on WhatsApp and email, and **Download card** appears.
5. **Admin → Card orders** shows the order, payment id, WhatsApp status (Sent → Delivered → Read) and every message in **Log**.
6. Expiry test: in Razorpay Test Mode you can't shorten a link, so check the **Generate new payment link** button by waiting 24 h or asking the developer to expire an order in the database.

## Environment variables

All keys are listed in `BACKEND/.env.example`. Nothing secret is stored in the code.

## Where things are

| Part | File |
|---|---|
| Order, notification, webhook-event models | `BACKEND/models/CardOrder.js`, `Notification.js`, `WebhookEvent.js` |
| Flow (links, payment, delivery, retries, jobs) | `BACKEND/services/cardOrders.js` |
| API for the dashboard + admin | `BACKEND/routes/cardOrders.js` (`/api/card-orders`) |
| Webhooks | `BACKEND/routes/webhooks.js` (`/api/webhooks/razorpay`, `/api/webhooks/whatsapp`) |
| Scheduled job | `BACKEND/routes/cron.js` (`/api/cron/card-orders`) |
| Razorpay / WhatsApp / PDF | `BACKEND/utils/razorpay.js`, `whatsapp.js`, `cardAssets.js` |
| Dashboard page | `FRONTEND/src/pages/GetCard.jsx` (`/dashboard/get-card`) |
| Admin page | `FRONTEND/src/pages/admin/AdminCardOrders.jsx` (`/admin/card-orders`) |
