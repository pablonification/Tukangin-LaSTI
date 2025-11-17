'use client';

import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { BaseCanvas } from "../../components/BaseCanvas";
import { TopBar } from "../../components/TopBar";
import Button from "../../components/Button";
import { StickyActions } from "../../components/StickyActions";

const OtpContent = () => {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const displayPhone = phoneParam ? `+62${phoneParam.replace(/^\+?62/, '').replace(/[^0-9]/g, '')}` : '+628123456789';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleResendCode = () => {
    setTimeLeft(120);
    setCanResend(false);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const handleNext = useCallback(() => {
    if (isOtpComplete) {
      window.location.href = '/profile/name';
    }
  }, [isOtpComplete]);

  useEffect(() => {
    if (isOtpComplete) {
      handleNext();
    }
  }, [isOtpComplete, handleNext]);

  return (
    <BaseCanvas>
      {/* Top Bar */}
      <TopBar backHref="/login" />

      {/* Main Content */}
      <div className="w-full max-w-sm mx-auto">
        {/* Title */}
        <h1 className="text-sh1b text-left text-black mb-1">
          Masukkan kode OTP yang dikirimkan ke {displayPhone}
        </h1>

        {/* Subtitle */}
        <p className="text-b2 text-left text-black mb-4">
          Kami mengirimkan kode 6-digit ke WhatsApp/SMS
        </p>

        {/* OTP Input Fields */}
        <div className="flex justify-center space-x-1 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-[48px] h-[72px] text-center text-sh1 text-black border border-[#9E9E9E] rounded-2xl focus:border-[#0CA2EB] focus:outline-none"
              placeholder=""
            />
          ))}
        </div>

        {/* Resend Code */}
        <div className="mb-28">
          {canResend ? (
            <Button
              onClick={handleResendCode}
              variant="secondary"
              size="lg"
            >
              <Image
                src="/otp.svg"
                alt="OTP icon"
                width={20}
                height={20}
              />
              <span className="text-b1m">Kirim ulang kode</span>
            </Button>
          ) : (
            <Button
              onClick={handleResendCode}
              variant="secondary"
              size="lg"
              className="opacity-60 cursor-not-allowed"
              disabled
            >
              <Image
                src="/otp.svg"
                alt="OTP icon"
                width={20}
                height={20}
                className="opacity-35"
              />
              <span className="text-b1m">Kirim ulang kode ({formatTime(timeLeft)})</span>
            </Button>
          )}
        </div>
      </div>

      <StickyActions className="border-t border-white">
        <Button
          variant="primary"
          size="lg"
          disabled={!isOtpComplete}
          onClick={handleNext}
          className={!isOtpComplete ? 'opacity-50 cursor-not-allowed mb-4' : 'mb-4'}
        >
          Selanjutnya
        </Button>
      </StickyActions>
    </BaseCanvas>
  );
};

const OtpPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpContent />
    </Suspense>
  );
};

export default OtpPage;
