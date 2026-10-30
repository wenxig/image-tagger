import sharp from 'sharp'
export async function imageminCompass(inputPath: string, quality = 70) {
  const compressedBuffer = await sharp(inputPath)
    .webp({ quality })
    .toBuffer()
  const base64Image = compressedBuffer.toString('base64')
  const dataUrl = `data:image/webp;base64,${base64Image}`
  return dataUrl
}