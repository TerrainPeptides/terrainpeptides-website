function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string; ext: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('Invalid data URL')
  const contentType = match[1]
  const b64 = match[2]
  const bin = Buffer.from(b64, 'base64')
  const ext =
    contentType === 'image/png' ? 'png' :
    contentType === 'image/webp' ? 'webp' :
    contentType === 'image/gif' ? 'gif' :
    contentType === 'image/jpeg' ? 'jpg' :
    'bin'
  return { bytes: new Uint8Array(bin), contentType, ext }
}

export async function maybeUploadImageDataUrl(args: {
  supabase: any
  bucket: string
  pathPrefix: string
  value: string | null | undefined
}): Promise<string | null> {
  const { supabase, bucket, pathPrefix, value } = args
  if (!value) return null
  if (!value.startsWith('data:')) return value

  try {
    const { bytes, contentType, ext } = dataUrlToBytes(value)
    const fileName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    let { error } = await supabase.storage.from(bucket).upload(fileName, bytes, {
      contentType,
      upsert: true,
    })
    if (error) {
      await supabase.storage.createBucket(bucket, { public: true })
      const retry = await supabase.storage.from(bucket).upload(fileName, bytes, {
        contentType,
        upsert: true,
      })
      if (retry.error) {
        console.warn('Image upload failed:', retry.error.message)
        return null
      }
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return data.publicUrl as string
  } catch (err) {
    console.warn('Image upload failed:', err)
    return null
  }
}

