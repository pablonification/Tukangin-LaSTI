'use client';

import { useState } from "react";
import { BaseCanvas } from "../../components/BaseCanvas";
import { TopBar } from "../../components/TopBar";
import Button from "../../components/Button";

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = () => {
    if (phoneNumber.trim()) {
      const phone = encodeURIComponent(phoneNumber.trim());
      window.location.href = `/otp?phone=${phone}`;
    }
  };

  return (
    <BaseCanvas>
      {/* Top Bar */}
      <TopBar backHref="/welcome" />

      {/*  Logo/Icon */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg mb-8"></div>
      
      {/* Title */}
      <h1 className="text-sh1b text-center text-black mb-4 leading-tight">
        #DiTukanginAja
      </h1>
      
      {/* Description */}
      <p className="text-b2 text-center text-black mb-8 leading-tight max-w-xs">
        Masuk atau daftar menggunakan nomor teleponmu untuk memulai
      </p>
      
      {/* Phone Number Input */}
      <div className="w-full max-w-sm mb-8">
        <label htmlFor="phone" className="block text-b3 text-black mb-2 text-left">
          Nomor Telepon*
        </label>
        <div className="flex items-center border-b border-gray-300 pb-2">
          <span className="text-sh3 text-black mr-2">(+62)</span>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Masukkan nomor telepon"
            className="flex-1 text-sh3 text-black placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
      </div>
      
      {/* Next Button */}
      <div className="w-full max-w-sm">
        <Button variant="primary" size="lg" onClick={handleSubmit}>
          Selanjutnya
        </Button>
      </div>
    </BaseCanvas>
  );
};

export default LoginPage;
