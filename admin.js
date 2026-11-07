// admin.js - ระบบการจัดการหลังบ้าน (Admin Control & System Update)
"use strict";

const ADMIN_DB_KEY = "chatbotgpt_around_ai_db_v15";
const ADMIN_REDEEM_KEY = "yy_redeem_codes_db";

const $ = s => document.querySelector(s);

function showToast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("opacity-0", "pointer-events-none");
    setTimeout(() => t.classList.add("opacity-0", "pointer-events-none"), 2500);
}

document.addEventListener("DOMContentLoaded", () => {
    loadAdminStats();
    setupAdminUpload();
});

function loadAdminStats() {
    const scripts = JSON.parse(localStorage.getItem(ADMIN_DB_KEY) || "[]");
    if ($("#adminScriptCount")) $("#adminScriptCount").textContent = `${scripts.length} Scripts`;

    const codes = JSON.parse(localStorage.getItem(ADMIN_REDEEM_KEY) || "{}");
    const codeCount = Object.keys(codes).length;
    if ($("#adminTotalCredits")) $("#adminTotalCredits").textContent = `${codeCount} Redeem Codes Active`;
}

let adminUploadedContent = null;
let adminUploadedFileName = "";

function setupAdminUpload() {
    const dropZone = $("#adminDropZone");
    const fileInput = $("#adminFileInput");
    const nameDisplay = $("#adminFileNameDisplay");
    const form = $("#adminUpdateForm");

    if (!dropZone) return;

    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const f = e.target.files[0];
        if (f) {
            adminUploadedFileName = f.name;
            nameDisplay.textContent = `เลือกไฟล์สำหรับอัปเดต: ${f.name}`;
            const r = new FileReader();
            r.onload = (evt) => adminUploadedContent = evt.target.result;
            r.readAsText(f);
        }
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        if (!adminUploadedContent) {
            return showToast("กรุณาเลือกไฟล์ที่ต้องการอัปเดตก่อน");
        }

        const targetType = $("#updateTargetType").value;

        if (targetType === "themark_json") {
            try {
                const parsed = JSON.parse(adminUploadedContent);
                if (parsed.codes) {
                    localStorage.setItem(ADMIN_REDEEM_KEY, JSON.stringify(parsed.codes));
                }
                showToast(`อัปเดตฐานข้อมูล ${adminUploadedFileName} สำเร็จ!`);
            } catch (err) {
                showToast("ไฟล์ JSON ไม่ถูกต้อง กรุณาตรวจสอบรูปแบบไฟล์");
                return;
            }
        } else {
            showToast(`อัปเดตไฟล์ระบบ ${adminUploadedFileName} เข้าสู่ระบบแอดมินเรียบร้อย`);
        }

        form.reset();
        adminUploadedContent = null;
        nameDisplay.textContent = "คลิกหรือลากไฟล์อัปเดตระบบมาวางที่นี่ (.json, .js)";
        loadAdminStats();
    };
}
