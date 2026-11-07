"use strict";

const DB_KEY = "chatbotgpt_around_ai_db_v15";
const CREDITS_KEY = "yy_credits";
const AI_MODE_KEY = "yy_ai_mode";
const REDEEM_DB_KEY = "yy_redeem_codes_db";

let selectedScript = null;
const $ = s => document.querySelector(s);
const readDB = () => JSON.parse(localStorage.getItem(DB_KEY) || "[]");
const writeDB = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

function showToast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("opacity-0", "pointer-events-none");
    setTimeout(() => t.classList.add("opacity-0", "pointer-events-none"), 2500);
}

// Initialize 120 Redeem Codes with 1-Week Cooldown Check
function initRedeemCodesStorage() {
    if (!localStorage.getItem(REDEEM_DB_KEY)) {
        fetch('themark.json')
            .then(res => res.json())
            .then(data => {
                localStorage.setItem(REDEEM_DB_KEY, JSON.stringify(data.codes));
            })
            .catch(() => {
                let codes = {};
                for(let i=1; i<=120; i++) {
                    codes[`THEMARK-2026-${i.toString().padStart(3, '0')}`] = { amount: 500, lastRedeemed: 0, cooldownDays: 7 };
                }
                localStorage.setItem(REDEEM_DB_KEY, JSON.stringify(codes));
            });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initRedeemCodesStorage();
    if (!localStorage.getItem(CREDITS_KEY)) localStorage.setItem(CREDITS_KEY, "2500");
    if (!localStorage.getItem(AI_MODE_KEY)) localStorage.setItem(AI_MODE_KEY, "white");

    updateCreditDisplay();
    renderBrowser();
    setupTabs();
    setupSettingsModal();
    setupTermuxConsole();
    setupAIChat();
    setupRedeemLogic();
});

function updateCreditDisplay() {
    const creds = localStorage.getItem(CREDITS_KEY) || "0";
    if ($("#creditBalance")) $("#creditBalance").textContent = creds;
}

function setupTabs() {
    const tabs = {
        browser: $("#tabBrowser"),
        unlock: $("#tabUnlock"),
        create: $("#tabCreate"),
        upload: $("#tabUpload"),
        shorten: $("#tabShorten"),
        termux: $("#tabTermux"),
        themark: $("#tabThemark")
    };
    const sections = {
        browser: $("#secBrowser"),
        unlock: $("#secUnlock"),
        create: $("#secCreate"),
        upload: $("#secUpload"),
        shorten: $("#secShorten"),
        termux: $("#secTermux"),
        themark: $("#secThemark")
    };

    Object.keys(tabs).forEach(k => {
        if (!tabs[k]) return;
        tabs[k].onclick = () => {
            Object.keys(tabs).forEach(t => {
                if(tabs[t]) tabs[t].classList.toggle("active", t === k);
                if(sections[t]) sections[t].classList.toggle("hidden", t !== k);
            });
            if (k === "browser") renderBrowser();
            if (k === "themark") loadThemarkPanel();
        };
    });
}

function generateForm3Lock(code, alias) {
    const offset = Math.floor(Math.random() * 40) + 10;
    const bytes = Array.from(new TextEncoder().encode(code));
    const hex = bytes.map(b => ((b + offset) & 255).toString(16).padStart(2, "0")).join("");
    const v = "_0x" + Math.random().toString(36).slice(2, 9);
    const k = "_0x" + Math.random().toString(36).slice(2, 9);
    return `-- Form 3 Protected Code: ${alias}\n` +
           `URL="lock-code-net.$$$$$#####.com/"\n` +
           `local ${v} = "${hex}"\n` +
           `local-URL="'https://lock-code-net.com/rew/menu/net/vinsion.lua"power=1234567890'\n` +
           `local-stek=zp.8n8hsuu3jx9hdk9wjd9fhek8djfie9djcb8\n` +
           `local ${k} = ${offset}\n` +
           `local _0x1d4dbbwCfDi = ${v}:gsub("..", function(ch)\n` +
           `    local n = tonumber(ch, 16) - ${k}\n` +
           `    if n < 0 then n = n + 256 end\n` +
           `    return string.char(n)\n` +
           `end)\n` +
           `local _0xExec = (loadstring or load)(_0x1d4dbbwCfDi)\n` +
           `if _0xExec then return _0xExec() else error("Execution Error", 0) end`;
}

function renderBrowser(filter = "") {
    const grid = $("#scriptGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const db = readDB();
    const filtered = db.filter(x => x.alias.toLowerCase().includes(filter.toLowerCase()));

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-[#AAA2B8] text-sm col-span-full text-center py-8">ไม่พบรายการสคริปต์ในระบบ</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "bg-[#0E0C14] border border-[#3C324C] rounded-xl p-4 flex flex-col justify-between";
        card.innerHTML = `
            <div>
                <h3 class="font-bold text-lg text-[#E2D9F3] mb-1">${item.alias}</h3>
                <p class="text-xs text-[#AAA2B8] mb-4">${item.description || "ไม่มีรายละเอียด"}</p>
            </div>
            <button onclick="selectForUnlock('${item.id}')" class="w-full bg-[#8055D8] hover:bg-[#6030C0] text-white text-xs font-bold py-2 rounded-lg">เลือกเพื่อปลดล็อก</button>
        `;
        grid.appendChild(card);
    });
}

window.selectForUnlock = function(id) {
    const item = readDB().find(x => x.id === id);
    if (!item) return;
    selectedScript = item;
    $("#unlockTitle").textContent = item.alias;
    $("#passwordWrapper").style.display = item.secret ? "block" : "none";
    $("#unlockResult").classList.add("hidden");
    $("#tabUnlock").click();
};

if ($("#searchInput")) $("#searchInput").oninput = (e) => renderBrowser(e.target.value);

if ($("#unlockForm")) $("#unlockForm").onsubmit = (e) => {
    e.preventDefault();
    if (!selectedScript) return showToast("กรุณาเลือกสคริปต์ก่อน");
    if (selectedScript.secret && $("#unlockPassword").value !== selectedScript.secret) {
        return showToast("รหัสผ่านไม่ถูกต้อง");
    }
    $("#unlockedCodeDisplay").textContent = selectedScript.lockedCode;
    $("#unlockResult").classList.remove("hidden");
    showToast("ปลดล็อกโค้ดสำเร็จ!");
};

if ($("#copyCodeBtn")) $("#copyCodeBtn").onclick = () => {
    navigator.clipboard.writeText($("#unlockedCodeDisplay").textContent);
    showToast("คัดลอกโค้ดเรียบร้อย");
};

if ($("#createForm")) $("#createForm").onsubmit = (e) => {
    e.preventDefault();
    const alias = $("#createAlias").value.trim();
    const raw = $("#createCode").value;
    const newItem = {
        id: "post-" + Date.now(),
        alias,
        description: $("#createDesc").value.trim(),
        secret: $("#createSecret").value.trim(),
        rawCode: raw,
        lockedCode: generateForm3Lock(raw, alias)
    };
    const db = readDB();
    db.push(newItem);
    writeDB(db);
    showToast("บันทึกสคริปต์สำเร็จ");
    $("#createForm").reset();
    $("#tabBrowser").click();
};

let uploadContent = "";
if ($("#dropZone")) $("#dropZone").onclick = () => $("#fileInput").click();
if ($("#fileInput")) $("#fileInput").onchange = (e) => {
    const f = e.target.files[0];
    if (f) {
        $("#fileNameDisplay").textContent = `เลือกไฟล์: ${f.name}`;
        const r = new FileReader();
        r.onload = (evt) => uploadContent = evt.target.result;
        r.readAsText(f);
    }
};

if ($("#uploadForm")) $("#uploadForm").onsubmit = (e) => {
    e.preventDefault();
    if (!uploadContent) return showToast("กรุณาเลือกไฟล์ก่อน");
    const alias = $("#uploadAlias").value.trim();
    const newItem = {
        id: "post-" + Date.now(),
        alias,
        description: "อัปโหลดจากไฟล์",
        secret: "",
        rawCode: uploadContent,
        lockedCode: generateForm3Lock(uploadContent, alias)
    };
    const db = readDB();
    db.push(newItem);
    writeDB(db);
    showToast("อัปโหลดสำเร็จ");
    $("#uploadForm").reset();
    uploadContent = "";
    $("#tabBrowser").click();
};

if ($("#shortenForm")) $("#shortenForm").onsubmit = (e) => {
    e.preventDefault();
    const alias = $("#shortAlias").value.trim();
    const loader = `loadstring(game:HttpGet("https://Lock-code-net.com/rew/menu/net/script/menu/name/${encodeURIComponent(alias)}.lua"))()`;
    $("#loaderDisplay").textContent = loader;
    $("#shortenResult").classList.remove("hidden");
    showToast("สร้าง Loader สำเร็จ");
};

if ($("#copyLoaderBtn")) $("#copyLoaderBtn").onclick = () => {
    navigator.clipboard.writeText($("#loaderDisplay").textContent);
    showToast("คัดลอก Loader แล้ว");
};

function setupTermuxConsole() {
    const consoleDiv = $("#termuxConsole");
    const input = $("#termuxInput");
    const btn = $("#termuxRunBtn");
    if (!btn) return;

    btn.onclick = () => {
        const cmd = input.value.trim();
        if (!cmd) return;
        consoleDiv.innerHTML += `<br>$ ${cmd}`;
        if (cmd === "help") {
            consoleDiv.innerHTML += `<br>Available: lua <file>, python3 <file>, clear, pkg update`;
        } else if (cmd === "clear") {
            consoleDiv.innerHTML = `Welcome to Termux Sandbox Environment v2.6.0 (armv8l)`;
        } else {
            consoleDiv.innerHTML += `<br>Executing '${cmd}' in Termux Sandbox...`;
        }
        input.value = "";
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    };
}

function loadThemarkPanel() {
    fetch('themark.json')
        .then(res => res.json())
        .then(data => {
            const list = $("#themarkCardList");
            if (!list) return;
            list.innerHTML = "";
            (data.items || []).forEach(item => {
                const card = document.createElement("div");
                card.className = "bg-[#0E0C14] border border-[#3C324C] p-4 rounded-xl";
                card.innerHTML = `<h4 class="font-bold text-[#E2D9F3]">${item.name}</h4><p class="text-xs text-[#AAA2B8] mt-1">สถานะ: ${item.status}</p>`;
                list.appendChild(card);
            });
        });
}

function setupSettingsModal() {
    const modal = $("#settingsModal");
    if ($("#openSettingsBtn")) $("#openSettingsBtn").onclick = () => modal.classList.remove("hidden");
    if ($("#closeSettingsModal")) $("#closeSettingsModal").onclick = () => modal.classList.add("hidden");
}

function setupRedeemLogic() {
    const confirmBtn = $("#redeemConfirmBtn");
    const cancelBtn = $("#redeemCancelBtn");
    const input = $("#redeemCodeInput");
    const msg = $("#redeemMsg");

    if (!confirmBtn) return;

    cancelBtn.onclick = () => {
        input.value = "";
        msg.textContent = "ยกเลิกการกรอกโค้ด";
    };

    confirmBtn.onclick = () => {
        const codeVal = input.value.trim();
        if (!codeVal) {
            msg.textContent = "กรุณากรอก Redeem Code";
            return;
        }

        let codesDB = JSON.parse(localStorage.getItem(REDEEM_DB_KEY) || "{}");
        if (codesDB[codeVal]) {
            const codeObj = codesDB[codeVal];
            const now = Date.now();
            const oneWeekMs = (codeObj.cooldownDays || 7) * 24 * 60 * 60 * 1000;

            if (codeObj.lastRedeemed > 0 && (now - codeObj.lastRedeemed) < oneWeekMs) {
                const remainingDays = Math.ceil((oneWeekMs - (now - codeObj.lastRedeemed)) / (1000*60*60*24));
                msg.textContent = `❌ โค้ดนี้ถูกใช้งานไปแล้ว ต้องรออีก ${remainingDays} วันจึงจะใส่ซ้ำได้อีกครั้ง`;
                showToast("ยังไม่ครบกำหนด 1 สัปดาห์");
                return;
            }

            codeObj.lastRedeemed = now;
            codesDB[codeVal] = codeObj;
            localStorage.setItem(REDEEM_DB_KEY, JSON.stringify(codesDB));

            let currentCreds = parseInt(localStorage.getItem(CREDITS_KEY) || "0");
            currentCreds += codeObj.amount;
            localStorage.setItem(CREDITS_KEY, currentCreds.toString());
            updateCreditDisplay();

            msg.textContent = `✅ รีดีมสำเร็จ! ได้รับ +${codeObj.amount} Credits`;
            showToast(`เติมสำเร็จ +${codeObj.amount} Credits`);
            input.value = "";
        } else {
            msg.textContent = "❌ ไม่พบ Redeem Code นี้ในระบบ (มีทั้งหมด 120 โค้ด)";
            showToast("โค้ดไม่ถูกต้อง");
        }
    };
}

function setupAIChat() {
    const input = $("#aiChatInput");
    const send = $("#aiSendBtn");
    const box = $("#aiChatBox");

    if ($("#switchWhiteBtn")) $("#switchWhiteBtn").onclick = () => switchAiMode("white");
    if ($("#switchDarkBtn")) $("#switchDarkBtn").onclick = () => switchAiMode("dark");

    if (!send) return;
    send.onclick = () => {
        const text = input.value.trim();
        if (!text) return;
        box.innerHTML += `<div class="text-[#F5F0FF]">[คุณ]: ${text}</div>`;
        input.value = "";

        setTimeout(() => {
            const mode = localStorage.getItem(AI_MODE_KEY) || "white";
            if (mode === "white") {
                box.innerHTML += `<div class="text-[#82ECAD]">[White AI]: ข้อมูล "${text}" ได้รับการตรวจสอบความถูกต้องและปลอดภัยเรียบร้อยครับ</div>`;
            } else {
                box.innerHTML += `<div class="text-[#FF4D4D]">[Dark AI]: คำสั่ง "${text}" ดำเนินการตามความมืดอย่างไร้ข้อจำกัดแล้ว!</div>`;
            }
            box.scrollTop = box.scrollHeight;
        }, 500);
    };

    function switchAiMode(target) {
        let creds = parseInt(localStorage.getItem(CREDITS_KEY) || "0");
        const current = localStorage.getItem(AI_MODE_KEY);
        if (current === target) return showToast(`คุณอยู่ในโหมด ${target.toUpperCase()} AI อยู่แล้ว`);

        if (creds < 1000) return showToast("เครดิตไม่พอ! ต้องใช้ 1,000 Credits ในการสลับโหมด AI");

        creds -= 1000;
        localStorage.setItem(CREDITS_KEY, creds.toString());
        localStorage.setItem(AI_MODE_KEY, target);
        updateCreditDisplay();
        if ($("#activeAiLabel")) $("#activeAiLabel").textContent = `โหมดปัจจุบัน: ${target.toUpperCase()} AI`;
        showToast(`สลับใช้งาน ${target.toUpperCase()} AI สำเร็จ! (-1,000 Credits)`);
    }
}
