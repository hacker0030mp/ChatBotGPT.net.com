// เพิ่มโค้ดส่วนนี้ลงในไฟล์ server.js ของโปรเจกต์ Node.js บน Render
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// 📌 เพิ่ม Route สำหรับรองรับหมวดหมู่ /rew/ และคืนค่าซอร์สโค้ด Lua ของสคริปต์จริง
app.get('/rew/*', (req, res) => {
    const fullPath = req.params[0]; // เช่น menu/net/script/menu/name/AARON.lua
    const scriptFileName = fullPath.split('/').pop() || "script.lua";
    
    // ตั้งค่า Header ให้เป็น Plain Text เพื่อให้ Executor (game:HttpGet) อ่านโค้ดได้ถูกต้อง
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    // ตัวอย่างซอร์สโค้ด Lua สำหรับสคริปต์ AARON หรือสคริปต์ทั่วไป
    const luaScriptContent = `
-- [ChatBotGPT-around-AI.com] AARON Script Loader
-- Loaded successfully via Render Server Backend v1.5
print("------------------------------------------")
print("🚀 AARON HUB LOADED SUCCESSFULLY (Yin-Yang Engine)")
print("------------------------------------------")

local Library = loadstring(game:HttpGet("https://raw.githubusercontent.com/xHeptc/Kavo-UI-Library/main/source.lua"))()
local Window = Library.CreateLib("AARON HUB - Yin-Yang Edition", "BloodTheme")

local Tab = Window:NewTab("Main")
local Section = Tab:NewSection("AARON Script Controls")

Section:NewButton("Notification Test", "Click to notify", function()
    Library:Notify("AARON", "Script executed successfully!", "Okay")
end)
    `;

    res.send(luaScriptContent.trim());
});

// Fallback สำหรับหน้าเว็บหลัก (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`ChatBotGPT-around-AI Server running on port ${PORT}`);
});

// Express Server Module
const express = require('express');
const router = express.Router();
router.get('/ping', (req, res) => res.json({ status: 'ok' }));
module.exports = router;
