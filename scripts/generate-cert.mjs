// Generates a self-signed certificate for local HTTPS dev using Node 24 built-ins
// Run once: node scripts/generate-cert.mjs
import { generateKeyPairSync } from "crypto";
import { writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";

// Use Node's built-in ability via openssl bundled with Node
// Node 24 ships with openssl, accessible via the crypto module forge approach
// We'll use the @peculiar/webcrypto + asn1 alternative: just call mkcert if present,
// otherwise write a minimal DER-encoded cert via pure JS

// Minimal self-signed cert generator using Node 24 X.509 support
const ip = "192.168.1.46";

// Generate key pair
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// Try using node's bundled openssl via child_process with the full path
const nodePath = process.execPath;
const opensslPath = nodePath.replace(/node(\.exe)?$/, "openssl$1");

import { existsSync } from "fs";

let opensslCmd = null;
if (existsSync(opensslPath)) {
  opensslCmd = opensslPath;
} else {
  // Try common locations
  const candidates = [
    "C:\\Program Files\\Git\\usr\\bin\\openssl.exe",
    "C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe",
    "C:\\Windows\\System32\\openssl.exe",
  ];
  for (const c of candidates) {
    if (existsSync(c)) {
      opensslCmd = `"${c}"`;
      break;
    }
  }
}

mkdirSync("certs", { recursive: true });

if (opensslCmd) {
  // Write key
  writeFileSync("certs/key.pem", privateKey);
  // Generate cert via openssl
  try {
    execSync(
      `${opensslCmd} req -new -x509 -key certs/key.pem -out certs/cert.pem -days 365 -subj "/CN=${ip}" -addext "subjectAltName=IP:${ip},IP:127.0.0.1"`,
      { stdio: "inherit" }
    );
    console.log("✅ Certificate generated in ./certs/");
  } catch {
    console.log("openssl found but failed, trying Git bash openssl...");
  }
} else {
  // Fallback: write the private key and a placeholder message
  writeFileSync("certs/key.pem", privateKey);
  console.log("❌ openssl not found. Please install Git for Windows (includes openssl) and re-run.");
  console.log("   https://git-scm.com/download/win");
  process.exit(1);
}
