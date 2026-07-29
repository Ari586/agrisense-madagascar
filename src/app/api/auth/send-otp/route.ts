import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();

// Initialiser Twilio seulement si les variables d'environnement sont présentes
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Générer un code à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Sauvegarder l'OTP dans la base de données (SmsLog)
    await prisma.smsLog.create({
      data: {
        phone,
        message: otp,
        type: 'otp',
        status: 'pending',
      },
    });

    // Envoyer le SMS
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Votre code de connexion AgriSense est : ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        console.log(`[Twilio] SMS envoyé à ${phone} : ${otp}`);
      } catch (smsError) {
        console.error("Erreur lors de l'envoi du SMS via Twilio:", smsError);
        // On continue même si l'envoi échoue en dev (le code est dans la DB/console)
      }
    } else {
      console.log(`[DEV MODE] Pas de Twilio configuré. Le code OTP pour ${phone} est : ${otp}`);
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
