"use client";

import { useState, useEffect } from "react";
import type { Provider, Preset } from "../types";
import {
  detectLanguage,
  detectCountry,
  getEmergencyNumber,
  type SupportedLanguage,
} from "../i18n";

export type TextSize = "small" | "medium" | "large";

/** RedRise uses the cellphone emergency number as the ZA primary route.
 *  10177 remains an ambulance/landline fallback in crisis UI copy. */
function primaryEmergencyNumber(country: string): string {
  return country.toUpperCase() === "ZA" ? "112" : getEmergencyNumber(country);
}

export function useSettings() {
  const [preset, setPreset] = useState<Preset>("free-best");
  const [provider, setProvider] = useState<Provider>("hf");
  const [apiKey, setApiKey] = useState("");
  const [hfToken, setHfToken] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [country, setCountry] = useState("US");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [readAloud, setReadAloud] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("medium");
  const [simpleLanguage, setSimpleLanguage] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [welcomeCompleted, setWelcomeCompleted] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState("112");
  const [explicitLanguage, setExplicitLanguage] = useState(false);

  useEffect(() => {
    const savedPreset = localStorage.getItem("medos_preset") as Preset;
    const savedProvider = localStorage.getItem("medos_provider") as Provider;
    const savedApiKey = localStorage.getItem("medos_api_key");
    const savedHfToken = localStorage.getItem("medos_hf_token");
    const savedAdvanced = localStorage.getItem("medos_advanced_mode");
    const savedLanguage = localStorage.getItem("medos_language") as SupportedLanguage;
    const savedCountry = localStorage.getItem("medos_country");
    const savedVoice = localStorage.getItem("medos_voice");
    const savedReadAloud = localStorage.getItem("medos_read_aloud");
    const savedTextSize = localStorage.getItem("medos_text_size") as TextSize;
    const savedSimple = localStorage.getItem("medos_simple_language");
    const savedDark = localStorage.getItem("medos_dark_mode");
    const savedWelcome = localStorage.getItem("medos_welcome_completed");
    const savedEmergency = localStorage.getItem("medos_emergency_number");
    const savedExplicit = localStorage.getItem("medos_explicit_language");

    if (savedPreset) setPreset(savedPreset);
    if (savedProvider) setProvider(savedProvider);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedHfToken) setHfToken(savedHfToken);
    if (savedAdvanced) setAdvancedMode(savedAdvanced === "true");
    setLanguage(savedLanguage || detectLanguage());
    const resolvedCountry = savedCountry || detectCountry();
    setCountry(resolvedCountry);
    if (savedVoice !== null) setVoiceEnabled(savedVoice === "true");
    if (savedReadAloud !== null) setReadAloud(savedReadAloud === "true");
    if (savedTextSize) setTextSize(savedTextSize);
    if (savedSimple !== null) setSimpleLanguage(savedSimple === "true");
    if (savedDark !== null) setDarkMode(savedDark === "true");
    if (savedWelcome) setWelcomeCompleted(savedWelcome === "true");

    // Override any legacy ZA value (including a previously cached 10177).
    const resolvedEmergency = resolvedCountry.toUpperCase() === "ZA"
      ? "112"
      : savedEmergency || primaryEmergencyNumber(resolvedCountry);
    setEmergencyNumber(resolvedEmergency);
    localStorage.setItem("medos_emergency_number", resolvedEmergency);

    if (savedExplicit !== null) setExplicitLanguage(savedExplicit === "true");
    setIsLoaded(true);
  }, []);

  useEffect(() => { if (isLoaded) localStorage.setItem("medos_preset", preset); }, [preset, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_provider", provider); }, [provider, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_api_key", apiKey); }, [apiKey, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    if (hfToken) localStorage.setItem("medos_hf_token", hfToken);
    else localStorage.removeItem("medos_hf_token");
  }, [hfToken, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_advanced_mode", String(advancedMode)); }, [advancedMode, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_language", language); }, [language, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("medos_country", country);
    const num = primaryEmergencyNumber(country);
    setEmergencyNumber(num);
    localStorage.setItem("medos_emergency_number", num);
  }, [country, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_voice", String(voiceEnabled)); }, [voiceEnabled, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_read_aloud", String(readAloud)); }, [readAloud, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_text_size", textSize); }, [textSize, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_simple_language", String(simpleLanguage)); }, [simpleLanguage, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_dark_mode", String(darkMode)); }, [darkMode, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_welcome_completed", String(welcomeCompleted)); }, [welcomeCompleted, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem("medos_explicit_language", String(explicitLanguage)); }, [explicitLanguage, isLoaded]);

  const setLanguageExplicit = (lang: SupportedLanguage) => { setLanguage(lang); setExplicitLanguage(true); };
  const setCountryExplicit = (c: string) => { setCountry(c); setExplicitLanguage(true); };

  const applyGeo = (g: { country: string; language: SupportedLanguage; emergencyNumber: string }) => {
    if (explicitLanguage) return;
    setCountry(g.country);
    setLanguage(g.language);
    setEmergencyNumber(primaryEmergencyNumber(g.country));
  };

  const clearApiKey = () => { setApiKey(""); localStorage.removeItem("medos_api_key"); };
  const clearHfToken = () => { setHfToken(""); localStorage.removeItem("medos_hf_token"); };

  return {
    preset, setPreset, provider, setProvider, apiKey, setApiKey, clearApiKey,
    hfToken, setHfToken, clearHfToken, isLoaded, explicitLanguage,
    setLanguageExplicit, setCountryExplicit, applyGeo, advancedMode, setAdvancedMode,
    language, setLanguage, country, setCountry, voiceEnabled, setVoiceEnabled,
    readAloud, setReadAloud, textSize, setTextSize, simpleLanguage, setSimpleLanguage,
    darkMode, setDarkMode, welcomeCompleted, setWelcomeCompleted, emergencyNumber, setEmergencyNumber,
  };
}
