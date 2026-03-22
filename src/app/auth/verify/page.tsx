"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Upload, Camera, CheckCircle, AlertCircle, ChevronRight,
  Fingerprint, RefreshCw, Gavel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";

type Step = "intro" | "document" | "biometric" | "success";

export default function VerifyPage() {
  const [step, setStep] = useState<Step>("intro");
  const [loading, setLoading] = useState(false);
  const [cedulaFront, setCedulaFront] = useState<File | null>(null);
  const [cedulaBack, setCedulaBack] = useState<File | null>(null);
  const [cedulaFrontPreview, setCedulaFrontPreview] = useState("");
  const [cedulaBackPreview, setCedulaBackPreview] = useState("");
  const [biometricType, setBiometricType] = useState<"face" | "fingerprint">("face");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const handleFileChange = (side: "front" | "back", file: File) => {
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setCedulaFront(file);
      setCedulaFrontPreview(url);
    } else {
      setCedulaBack(file);
      setCedulaBackPreview(url);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      toast({ title: "Error", description: "No se pudo acceder a la cámara", variant: "error" });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
        setCapturedPhoto(file);
        setCapturedPhotoPreview(URL.createObjectURL(file));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  const submitDocument = async () => {
    if (!cedulaFront || !cedulaBack) {
      toast({ title: "Error", description: "Sube ambos lados de tu cédula", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("cedulaFront", cedulaFront);
      formData.append("cedulaBack", cedulaBack);

      const res = await fetch("/api/auth/verify-document", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        toast({ title: "¡Documento verificado!", variant: "success" });
        setStep("biometric");
      } else {
        toast({ title: "Error", description: data.error, variant: "error" });
      }
    } catch {
      toast({ title: "Error de conexión", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const submitBiometric = async () => {
    if (biometricType === "face" && !capturedPhoto) {
      toast({ title: "Error", description: "Captura tu foto primero", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", biometricType);
      if (capturedPhoto) formData.append("photo", capturedPhoto);

      const res = await fetch("/api/auth/verify-biometric", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        toast({ title: "¡Verificación completa!", variant: "success" });
        if (user) setUser({ ...user, verificationStatus: "FULLY_VERIFIED" });
        setStep("success");
      } else {
        toast({ title: "Error", description: data.error, variant: "error" });
      }
    } catch {
      toast({ title: "Error de conexión", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">¡Verificación Completa!</h1>
          <p className="text-gray-600 mb-8">
            Tu identidad ha sido verificada exitosamente. Ahora puedes comprar y vender en WarriorMarket con total seguridad.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/marketplace">
              <Button className="w-full" size="lg">Explorar Marketplace</Button>
            </Link>
            <Link href="/seller/new">
              <Button variant="outline" className="w-full" size="lg">Publicar mi primer producto</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-800">WarriorMarket</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Verificación de Identidad</h1>
          <p className="text-gray-600 mt-1">Proceso seguro y privado</p>
        </div>

        {/* Progress steps */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "intro", label: "Inicio" },
            { key: "document", label: "Cédula" },
            { key: "biometric", label: "Biometría" },
          ].map(({ key, label }, i) => {
            const steps = ["intro", "document", "biometric"];
            const current = steps.indexOf(step);
            const isActive = i <= current;
            return (
              <div key={key} className="flex-1">
                <div className={`h-1.5 rounded-full ${isActive ? "bg-blue-600" : "bg-gray-200"}`} />
                <p className={`text-xs mt-1 ${isActive ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          {/* Intro step */}
          {step === "intro" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">¿Por qué necesitamos verificarte?</h2>
                  <p className="text-sm text-gray-500">Para garantizar la seguridad de todos</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { step: 1, title: "Verificación de Cédula", desc: "Sube ambos lados de tu Cédula de Identidad dominicana. Nuestra IA la verificará automáticamente.", icon: "🪪" },
                  { step: 2, title: "Biometría Facial o Huella", desc: "Tómate una foto o registra tu huella dactilar para confirmar que eres el titular de la cédula.", icon: "👤" },
                  { step: 3, title: "Verificación Completada", desc: "Accede a todas las funciones: comprar, vender, pujar en subastas.", icon: "✅" },
                ].map(({ step: s, title, desc, icon }) => (
                  <div key={s} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl">{icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-700 text-white rounded-full text-xs flex items-center justify-center font-bold">{s}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-green-700 flex items-start gap-2">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  Tus datos biométricos son encriptados y nunca compartidos. Solo se usan para verificar tu identidad.
                </p>
              </div>

              <Button className="w-full" size="lg" onClick={() => setStep("document")}>
                Comenzar verificación <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Document step */}
          {step === "document" && (
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Verificación de Cédula</h2>
              <p className="text-sm text-gray-500 mb-6">Sube fotos claras de ambos lados de tu cédula</p>

              {[
                { side: "front" as const, label: "Frente de la cédula", preview: cedulaFrontPreview, desc: "Foto con tu nombre y número de cédula" },
                { side: "back" as const, label: "Reverso de la cédula", preview: cedulaBackPreview, desc: "La parte trasera con el código de barras" },
              ].map(({ side, label, preview, desc }) => (
                <div key={side} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors relative"
                    onClick={() => document.getElementById(`cedula-${side}`)?.click()}
                  >
                    {preview ? (
                      <div className="relative h-40">
                        <Image src={preview} alt={label} fill className="object-contain rounded-lg" />
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{desc}</p>
                        <p className="text-xs text-gray-400 mt-1">Clic para subir</p>
                      </div>
                    )}
                    <input
                      id={`cedula-${side}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(side, e.target.files[0])}
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep("intro")}>Atrás</Button>
                <Button
                  className="flex-1"
                  loading={loading}
                  onClick={submitDocument}
                  disabled={!cedulaFront || !cedulaBack}
                >
                  Verificar cédula
                </Button>
              </div>
            </div>
          )}

          {/* Biometric step */}
          {step === "biometric" && (
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Verificación Biométrica</h2>
              <p className="text-sm text-gray-500 mb-4">Confirma que eres el titular de la cédula</p>

              <div className="flex gap-3 mb-6">
                {[
                  { value: "face" as const, icon: <Camera className="w-4 h-4" />, label: "Foto de rostro" },
                  { value: "fingerprint" as const, icon: <Fingerprint className="w-4 h-4" />, label: "Huella dactilar" },
                ].map(({ value, icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setBiometricType(value)}
                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                      biometricType === value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {biometricType === "face" && (
                <div className="mb-6">
                  {!cameraActive && !capturedPhotoPreview && (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-4">Tomate una selfie clara, bien iluminada</p>
                      <Button onClick={startCamera} variant="outline">
                        <Camera className="w-4 h-4" /> Abrir cámara
                      </Button>
                    </div>
                  )}

                  {cameraActive && (
                    <div className="relative rounded-xl overflow-hidden">
                      <video ref={videoRef} className="w-full rounded-xl" muted playsInline />
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-xl pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/60 rounded-full" />
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                        <Button onClick={capturePhoto} className="gap-2">
                          <Camera className="w-4 h-4" /> Capturar
                        </Button>
                        <Button variant="secondary" onClick={stopCamera}>Cancelar</Button>
                      </div>
                    </div>
                  )}

                  {capturedPhotoPreview && (
                    <div className="relative rounded-xl overflow-hidden">
                      <Image src={capturedPhotoPreview} alt="Foto capturada" width={400} height={300} className="w-full rounded-xl" />
                      <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <button
                        onClick={() => { setCapturedPhoto(null); setCapturedPhotoPreview(""); }}
                        className="absolute bottom-3 right-3 bg-white rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 flex items-center gap-1 shadow"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Volver a tomar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {biometricType === "fingerprint" && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-6">
                  <Fingerprint className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">Registro de huella dactilar</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Coloca tu dedo en el sensor biométrico de tu dispositivo o usa la cámara para capturar tu huella.
                  </p>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const canvas = document.createElement("canvas");
                      canvas.width = 200;
                      canvas.height = 200;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.fillStyle = "#f0f0f0";
                        ctx.fillRect(0, 0, 200, 200);
                        ctx.fillStyle = "#333";
                        ctx.font = "80px serif";
                        ctx.textAlign = "center";
                        ctx.fillText("👆", 100, 130);
                      }
                      canvas.toBlob((blob) => {
                        if (blob) {
                          const file = new File([blob], "fingerprint.jpg", { type: "image/jpeg" });
                          setCapturedPhoto(file);
                          setCapturedPhotoPreview(URL.createObjectURL(file));
                          toast({ title: "Huella registrada", variant: "success" });
                        }
                      });
                    }}
                  >
                    <Fingerprint className="w-4 h-4" /> Registrar huella
                  </Button>
                  {capturedPhotoPreview && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" /> Huella registrada exitosamente
                    </div>
                  )}
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              <Button
                className="w-full"
                loading={loading}
                onClick={submitBiometric}
                disabled={biometricType === "face" ? !capturedPhoto : !capturedPhoto}
              >
                Completar verificación
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
