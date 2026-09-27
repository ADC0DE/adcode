import nodemailer from 'npm:nodemailer@6.10.1'

const SMTP = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'min1512@genaidev.io',
  pass: 'tlusdeaoectefhvm',
}

const ADMIN_TO = [
  'adcode_mkt@naver.com',
  'thegoingsolution@gmail.com',
]

const BROCHURE_FILENAME = '애드코드_회사소개서_2026.pdf'
const BROCHURE_URL = `https://adcode.co.kr/public/${encodeURIComponent(BROCHURE_FILENAME)}`

async function loadBrochureAttachment() {
  try {
    const res = await fetch(BROCHURE_URL)
    if (!res.ok) {
      console.warn('[notify-inquiry] brochure fetch failed', res.status)
      return null
    }
    const content = new Uint8Array(await res.arrayBuffer())
    return {
      filename: BROCHURE_FILENAME,
      content,
      contentType: 'application/pdf',
    }
  } catch (err) {
    console.warn('[notify-inquiry] brochure fetch error', err)
    return null
  }
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatKst(value: unknown) {
  const d = value ? new Date(String(value)) : new Date()
  if (Number.isNaN(d.getTime())) return String(value ?? '')
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d) + ' (KST)'
}

function buildMail(inquiry: Record<string, unknown>) {
  const subject = `[ADCODE 문의] ${inquiry.company_name || ''} - ${inquiry.name || ''}`
  const rows: Array<[string, unknown]> = [
    ['접수일시', formatKst(inquiry.created_at)],
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

function buildReplyMail(inquiry: Record<string, unknown>) {
  const customerName = String(inquiry.name || '고객')
  const subject = '[ADCODE] 문의 접수 및 회사소개서 전달드립니다'
  const text = [
    `${customerName}님, 문의해주셔서 감사합니다.`,
    '',
    '요청하신 회사소개서를 첨부해드립니다.',
    '확인 후 빠른 시일 내에 연락드리겠습니다.',
    '',
    '- ADCODE',
  ].join('\n')
  const html = `
    <div style="font-family:Apple SD Gothic Neo,Malgun Gothic,sans-serif;line-height:1.7;color:#111">
      <p style="margin:0 0 12px">${escapeHtml(customerName)}님, 문의해주셔서 감사합니다.</p>
      <p style="margin:0 0 12px">요청하신 회사소개서를 첨부해드립니다.</p>
      <p style="margin:0">확인 후 빠른 시일 내에 연락드리겠습니다.<br/>- ADCODE</p>
    </div>
  `
  return { subject, text, html }
}

// 알리고는 등록된 고정 IP만 받는다. Supabase Edge는 IP가 바뀌므로
// 우편나라(NAT Elastic IP)가 대신 보낸다. 수신번호는 우편나라 중계에 있다.
const WPNARA_SMS_RELAY_URL = Deno.env.get('WPNARA_SMS_RELAY_URL')
  || 'https://wpnara.com/api/internal/adcode-inquiry-sms'

function eucKrBytes(text: string) {
  let n = 0
  for (const ch of text) {
    n += (ch.codePointAt(0) ?? 0) <= 0x7f ? 1 : 2
  }
  return n
}

function trimEucKr(text: string, maxBytes: number) {
  let n = 0
  let out = ''
  for (const ch of text) {
    const size = (ch.codePointAt(0) ?? 0) <= 0x7f ? 1 : 2
    if (n + size > maxBytes) return out
    out += ch
    n += size
  }
  return out
}

function buildSmsText(inquiry: Record<string, unknown>) {
  const head = [
    '[ADCODE 문의]',
    `상호: ${inquiry.company_name ?? ''}`,
    `성함: ${inquiry.name ?? ''}`,
    `연락처: ${inquiry.phone ?? ''}`,
    `이메일: ${inquiry.email ?? ''}`,
    `서비스: ${inquiry.services ?? ''}`,
    `연락방법: ${inquiry.contact_method ?? ''}`,
    '내용: ',
  ].join('\n')
  const room = Math.max(0, 2000 - eucKrBytes(head))
  return head + trimEucKr(String(inquiry.message ?? ''), room)
}

async function sendInquirySms(inquiry: Record<string, unknown>) {
  const secret = Deno.env.get('WPNARA_SMS_RELAY_SECRET') || ''
  if (!secret) {
    throw new Error('WPNARA_SMS_RELAY_SECRET is not set')
  }

  const res = await fetch(WPNARA_SMS_RELAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      title: 'ADCODE 문의',
      msg: buildSmsText(inquiry),
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok !== true) {
    throw new Error(String(data.error || data.message || `wpnara http ${res.status}`))
  }
  return data
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
    const replyMail = buildReplyMail(inquiry)
    const brochure = await loadBrochureAttachment()
    const attachments = brochure ? [brochure] : []

    // 관리자 알림 + 문의자 회사소개서 회신 + 담당자 문자를 각각 독립 발송
    // (한쪽 실패해도 다른 쪽은 계속 시도)
    const [adminResult, customerResult, smsResult] = await Promise.allSettled([
      transporter.sendMail({
        from: `"ADCODE 문의" <${SMTP.user}>`,
        to: ADMIN_TO.join(', '),
        replyTo: String(inquiry.email),
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        attachments,
      }),
      transporter.sendMail({
        from: `"ADCODE" <${SMTP.user}>`,
        to: String(inquiry.email),
        subject: replyMail.subject,
        text: replyMail.text,
        html: replyMail.html,
        attachments,
      }),
      sendInquirySms(inquiry),
    ])

    if (adminResult.status === 'rejected') {
      console.error('[notify-inquiry] admin mail failed', adminResult.reason)
    }
    if (customerResult.status === 'rejected') {
      console.error('[notify-inquiry] customer brochure mail failed', customerResult.reason)
    }
    if (smsResult.status === 'rejected') {
      console.error('[notify-inquiry] sms failed', smsResult.reason)
    }
    if (!brochure) {
      console.warn('[notify-inquiry] brochure attachment missing')
    }

    if (adminResult.status === 'rejected' && customerResult.status === 'rejected') {
      throw new Error('Both admin and customer emails failed')
    }

    return new Response(JSON.stringify({
      ok: true,
      adminSent: adminResult.status === 'fulfilled',
      customerSent: customerResult.status === 'fulfilled',
      smsSent: smsResult.status === 'fulfilled',
      brochureAttached: Boolean(brochure),
    }), {
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
