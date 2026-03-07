import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface TransferEmailProps {
  toEmail: string
  userName: string
  sourcePlaylist: string
  targetPlatform: string
  totalTracks: number
  failedTracks: number
}

export async function sendTransferCompleteEmail({
  toEmail,
  userName,
  sourcePlaylist,
  targetPlatform,
  totalTracks,
  failedTracks
}: TransferEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Skipping email delivery.')
    return
  }

  const isPerfect = failedTracks === 0
  const subject = isPerfect 
    ? `✅ Transfer Complete: ${sourcePlaylist}` 
    : `⚠️ Transfer Finished with Errors: ${sourcePlaylist}`

  try {
    const { data, error } = await resend.emails.send({
      from: 'PlaySync <noreply@playsync.app>', // Update with verified domain
      to: [toEmail],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Hello ${userName},</h2>
          <p>Your playlist transfer for <strong>${sourcePlaylist}</strong> to <strong>${targetPlatform}</strong> has finished processing!</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>Total Tracks:</strong> ${totalTracks}</p>
            <p style="margin: 10px 0 0 0; font-size: 16px; color: ${isPerfect ? '#10b981' : '#ef4444'};">
              <strong>Failed Tracks:</strong> ${failedTracks}
            </p>
          </div>

          <p>Log in to your Dashboard to view the complete transfer logs and launch new migrations.</p>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
            Go to Dashboard
          </a>
        </div>
      `,
    })

    if (error) {
       console.error('Resend API Delivery Error:', error)
    }
  } catch (error) {
     console.error('Resend Exception:', error)
  }
}
