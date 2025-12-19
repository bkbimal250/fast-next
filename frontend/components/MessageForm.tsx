/**
 * Message form component for contacting SPA directly
 */

'use client'

export default function MessageForm({ spaId, jobId }: { spaId?: number; jobId?: number }) {
  return (
    <form>
      <input type="text" name="sender_name" placeholder="Your Name" required />
      <input type="tel" name="phone" placeholder="Phone" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Your message" required />
      <button type="submit">Send Message</button>
    </form>
  )
}

