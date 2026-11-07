const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ให้บริการไฟล์ Static จากโฟลเดอร์หลัก
app.use(express.static(path.join(__dirname)));

// 📌 เพิ่ม Route สำหรับรองรับหมวดหมู่ /rew/ (เช่น /rew/menu/net/script/menu/name/AARON.lua)
app.get('/rew/*', (req, res) => {
    const fullPath = req.params[0]; // ดึงพาทที่เหลือหลัง /rew/
    const scriptName = fullPath.split('/').pop() || "script.lua";
    
    // ตั้งค่า Content-Type เป็น text/plain เพื่อให้ Roblox Executor อ่านโค้ด Lua ได้ถูกต้อง
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    // ชุดซอร์สโค้ด Lua สำหรับส่งมอบให้ผู้ใช้งาน
    const luaCode = `
-- ==========================================
-- [ChatBotGPT-around-AI.com] AARON Script Loader
-- Generated & Secured via Render Backend Gateway v1.5
-- ==========================================
print("------------------------------------------")
print("🚀 LOADING AARON HUB (Yin-Yang Engine)...")
print("------------------------------------------")

local success, result = pcall(function()
    return loadstring(game:HttpGet("https://chatbotgpt-net-com.onrender.com/rew/menu/net/script/menu/name/AARON.lua"))()
end)

if success then
    print("✅ UI Library Loaded Successfully!")
else
    warn("⚠️ Failed to load UI Library, running fallback mode.")
end

-- Main Script Logic Here
print("✨ AARON Script Executed Successfully!")
    `;

    res.send(luaCode.trim());
});

// Fallback Route สำหรับหน้าหลักพอร์ทัล
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 ChatBotGPT-around-AI Server running on port ${PORT}`);
});
