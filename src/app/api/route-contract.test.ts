import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { POST as chatPost } from './chat/route'
import { POST as diagnosePost } from './diagnose/route'
import { POST as iotPost } from './iot/route'

function jsonRequest(body: string) {
  return new NextRequest('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
}

describe('API request contracts', () => {
  it('rejects oversized chat messages before calling Gemini', async () => {
    const response = await chatPost(
      jsonRequest(JSON.stringify({ message: 'x'.repeat(2_001) }))
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Le message doit contenir entre 1 et 2 000 caractères.',
    })
  })

  it('rejects malformed chat JSON', async () => {
    const response = await chatPost(jsonRequest('{"message":'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Le corps de la requête doit être un JSON valide.',
    })
  })

  it('rejects unsupported diagnosis image formats before calling Gemini', async () => {
    const response = await diagnosePost(
      jsonRequest(JSON.stringify({ image: 'data:image/gif;base64,AAAA' }))
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Formats acceptés : JPEG, PNG, WebP et HEIC encodés en base64.',
    })
  })

  it('rejects sensor readings outside the physical humidity range', async () => {
    const response = await iotPost(
      jsonRequest(JSON.stringify({ deviceId: 'TEST_SENSOR', soilMoisture: -1 }))
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
    })
  })

  it('preserves a valid zero-degree sensor reading', async () => {
    const response = await iotPost(
      jsonRequest(
        JSON.stringify({
          deviceId: 'TEST_SENSOR',
          soilMoisture: 50,
          temperature: 0,
        })
      )
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      currentData: { temperature: 0 },
    })
  })
})