import nodemailer from 'npm:nodemailer@6.10.1'

const SMTP = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'min1512@genaidev.io',
  pass: 'tlusdeaoectefhvm',
}

const ADMIN_TO = [
  'usarmy0220@naver.com',
  'thegoingsolution@gmail.com',
]

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildMail(inquiry: Record<string, unknown>) {
  const subject = `[ADCODE 문의] ${inquiry.company_name || ''} - ${inquiry.name || ''}`
  const rows: Array<[string, unknown]> = [
    ['접수일시', inquiry.created_at || new Date().toISOString()],
    ['상호명', inquiry.company_name],
    ['성함', inquiry.name],
    ['연락처', inquiry.phone],
    ['이메일', inquiry.email],
    ['희망서비스', inquiry.services],
    ['연락방법', inquiry.contact_method],
    ['문의내용', inquiry.message],
  ]

  const text = rows.map(([k, v]) => `${k}: ${v ?? ''}`).join('\n')
  const html = `
    <div style="font-family:Apple SD Gothic Neo,Malgun Gothic,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 16px">ADCODE 웹사이트 문의</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        ${rows.map(([k, v]) => `
          <tr>
            <th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f7f7f7;width:140px">${escapeHtml(k)}</th>
            <td style="padding:10px;border:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `

  return { subject, text, html }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  try {
    const inquiry = await req.json()
    if (!inquiry?.company_name || !inquiry?.name || !inquiry?.phone || !inquiry?.email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const transporter = nodemailer.createTransport({
      host: SMTP.host,
      port: SMTP.port,
      secure: SMTP.secure,
      auth: {
        user: SMTP.user,
        pass: SMTP.pass,
      },
    })

    const mail = buildMail(inquiry)
    await transporter.sendMail({
      from: `"ADCODE 문의" <${SMTP.user}>`,
      to: ADMIN_TO.join(', '),
      replyTo: String(inquiry.email),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    console.error('[notify-inquiry]', err)
    return new Response(JSON.stringify({
      error: 'Failed to send email',
      detail: err instanceof Error ? err.message : String(err),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
