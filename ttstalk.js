/*
---------------------------------------------------------------

• Fitur : Tiktok Stalk - ttstalk
• Creator : @Lynx decode
• My channel - share code : https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i
• Rilis - upload : 5 Mei 2026
• Notes : Jangan hapus wm! - jangan hapus credit ini hargai pembuat - creator !!

---------------------------------------------------------------
*/

import axios from 'axios'

class TikTokScraper {
  constructor() {
    this.baseURL = 'https://tools.xrespond.com/api/tiktok/profile'
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Origin': 'https://tools.xrespond.com',
        'Referer': 'https://tools.xrespond.com/'
      },
      timeout: 15000
    })
  }

  async request(endpoint, username) {
    const { data } = await this.client.post(
      `${this.baseURL}/${endpoint}`,
      { profile: username }
    )
    return data
  }

  async getAll(username) {
    try {
      const [profileRes, videoRes] = await Promise.all([
        this.request('details', username),
        this.request('videos', username)
      ])

      if (!profileRes || profileRes.status !== 'success') {
        return { success: false, message: 'Gagal mengambil data profil.' }
      }

      const u = profileRes.data.data.user
      const s = profileRes.data.data.stats
      const videos = videoRes && videoRes.status === 'success' ? videoRes.data.data.videos : []

      return {
        success: true,
        profile: {
          id: u.id,
          username: u.uniqueId,
          nickname: u.nickname,
          signature: u.signature,
          verified: u.verified,
          avatar: u.avatarLarger,
          stats: {
            followers: s.followerCount,
            following: s.followingCount,
            likes: s.heartCount,
            videos: s.videoCount
          }
        },
        videos
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*Contoh:* ${usedPrefix + command} wirdan.rmx`
  
  await m.react('⏳')
  const scraper = new TikTokScraper()
  const res = await scraper.getAll(text.replace('@', ''))

  if (!res.success) {
    await m.react('❌')
    throw res.message
  }

  const p = res.profile
  let caption = `┌˚₊ ๑│ ᴛɪᴋᴛᴏᴋ sᴛᴀʟᴋᴇʀ │๑˚₊ 🎀
┇ ✨ › ɴɪᴄᴋɴᴀᴍᴇ : ${p.nickname}
┇ 🆔 › ɪᴅ : ${p.id}
┇ 👤 › ᴜsᴇʀɴᴀᴍᴇ : @${p.username}
┇ 📝 › sɪɢɴᴀᴛᴜʀᴇ : ${p.signature || 'Kosong'}
┇ ✅ › ᴠᴇʀɪꜰɪᴇᴅ : ${p.verified ? 'Ya' : 'Tidak'}
└˚₊ ๑ 🌸 ๑˚₊

┌˚ · ๑୧ s ᴛ ᴀ ᴛ ɪ s ᴛ ɪ ᴄ
┇ 👥 ⁞ ꜰᴏʟʟᴏᴡᴇʀs : ${p.stats.followers}
┇ 👣 ⁞ ꜰᴏʟʟᴏᴡɪɴɢ : ${p.stats.following}
┇ ❤️ ⁞ ᴛᴏᴛᴀʟ ʟɪᴋᴇ : ${p.stats.likes}
┇ 🎥 ⁞ ᴛᴏᴛᴀʟ ᴠɪᴅᴇᴏ : ${p.stats.videos}
└˚₊ ๑୧`

  if (res.videos.length > 0) {
    caption += `\n\n───────────────────\n\n🎥 *Latest Videos from @${p.username}*`
    res.videos.slice(0, 3).forEach((v, i) => {
      caption += `\n\n${i + 1}. ${v.title || 'No Title'}\n🔗 Link No WM: ${v.play}`
    })
  }

  await conn.sendMessage(m.chat, { 
    image: { url: p.avatar }, 
    caption: caption,
    contextInfo: global.adReply?.contextInfo || {} 
  }, { quoted: m })

  await m.react('✅')
}

handler.help = ['ttstalk']
handler.tags = ['tools']
handler.command = /^(ttstalk|tiktokstalk|ttstalk2)$/i

export default handler
