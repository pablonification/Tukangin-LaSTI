'use client';

import { useState } from "react";
import { BaseCanvas } from "../../components/BaseCanvas";
import { TopBar } from "../../components/TopBar";
import Button from "../../components/Button";
import { getSupabaseBrowser } from "@/lib/supabase";

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      setLoading(false);
    }
  };

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

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-sm mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Google Login Button */}
      <div className="w-full max-w-sm mb-4">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Masuk dengan Google'}
        </Button>
      </div>

      <div className="w-full max-w-sm mb-4 text-center text-gray-500">
        atau
      </div>
      
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
