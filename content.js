// content.js - FINAL (Hybrid: Insta Embed / YouTube Redirect)

// --- 1. UTILITIES ---
function hashPassword(pass) { return 'SG_' + pass.split('').reverse().join(''); }

// Helper: Convert Embed URL to Watch URL for redirection
function getWatchUrl(embedUrl) {
    const id = embedUrl.split('/').pop();
    return `https://www.youtube.com/watch?v=${id}`;
}

async function getQuizForTopic(topic, isReteach) {
    await new Promise(r => setTimeout(r, 600)); 
    if (isReteach && topic.questions_batch_2) return topic.questions_batch_2;
    if (topic.questions_batch_1) return topic.questions_batch_1;
    return [{ q: "Error.", o: ["OK"], a: 0, e: "Error." }];
}

function getRank(points) {
    if (points < 50) return "Novice";
    if (points < 150) return "Apprentice";
    if (points < 300) return "Developer";
    if (points < 500) return "Engineer";
    return "Spartan God";
}

// --- 2. STATE ---
let user = null;
let currentTopicIndex = 0;
let isReteachMode = false;
let DB_TOPICS = []; 
let scrollObserver = null;
let isScrolling = false;
let timeUntilDeduction = 60;
let currentUrl = ""; 
let sessionPenalties = 0; 
let lastKeyTime = 0;
let isFlashing = false; 

// Stats
let questionStartTime = 0;

// --- 3. VIDEO CONTROL ---
function stopAllVideos() {
    document.querySelectorAll('video').forEach(v => { v.pause(); v.muted = true; });
}

// --- 4. INIT ---
(async () => {
    const data = await chrome.storage.local.get(["sgUser", "sgTopicIndex", "sglsReteachMode", "sgLearningState"]);
    
    if (data.sgTopicIndex) currentTopicIndex = data.sgTopicIndex;
    if (data.sglsReteachMode) isReteachMode = data.sglsReteachMode;

    if (data.sgUser) {
        user = data.sgUser;
        if (!user.stats) user.stats = { questionsAnswered: 0, totalTime: 0, wrongAnswers: 0 };
        DB_TOPICS = user.domain === 'java' ? DB_TOPICS_JAVA : DB_TOPICS_PYTHON;

        // CHECK: Are we currently in a YouTube Learning Session?
        if (data.sgLearningState && data.sgLearningState.active) {
            handleLearningSession(data.sgLearningState);
        } else {
            createOverlayElements();
            stopAllVideos();
            showLogin(true);
        }
    } else {
        createOverlayElements();
        stopAllVideos();
        showLogin(false);
    }
})();

// --- 5. LEARNING SESSION LOGIC (YOUTUBE FOCUS MODE ONLY) ---
function handleLearningSession(learningState) {
    const isYouTube = location.href.includes("youtube.com/watch");
    
    if (isYouTube) {
        // ON YOUTUBE: Enter Focus Mode (Hide sidebar)
        console.log("ScrollGuard: YouTube Focus Mode Active");
        document.body.classList.add('sg-focus-mode'); 
        
        const btn = document.createElement('button');
        btn.id = 'sg-return-btn';
        btn.innerText = "✅ Finish & Take Quiz";
        btn.onclick = () => {
            const ret = learningState.returnUrl;
            // Mark ready for quiz and return
            chrome.storage.local.set({ 
                sgLearningState: { active: true, readyForQuiz: true, returnUrl: ret } 
            }, () => { window.location.href = ret; });
        };
        document.body.appendChild(btn);

    } else {
        // BACK ON APP (Insta/YouTube Home): Start Quiz
        if (learningState.readyForQuiz) {
            chrome.storage.local.remove("sgLearningState");
            if (currentTopicIndex >= DB_TOPICS.length) currentTopicIndex = 0;
            const topic = DB_TOPICS[currentTopicIndex];
            createOverlayElements();
            runQuiz(topic); // Jump straight to quiz
        }
    }
}

function startLearningRedirect(topic) {
    const watchUrl = getWatchUrl(isReteachMode ? topic.video_reteach : topic.video_main);
    const learningState = {
        active: true,
        readyForQuiz: false,
        returnUrl: window.location.href // Remember where we came from
    };
    chrome.storage.local.set({ sgLearningState: learningState }, () => {
        window.location.href = watchUrl; // Go to YouTube
    });
}

// --- 6. UI BUILDERS ---
function createOverlayElements() {
    if (!document.getElementById('scroll-guard-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'scroll-guard-overlay';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
    }
    // Corner Widget
    if (!document.getElementById('sg-timer')) {
        const widget = document.createElement('div');
        widget.id = 'sg-timer';
        widget.style.display = 'none';
        const textSpan = document.createElement('span');
        textSpan.id = 'sg-timer-text';
        textSpan.style.minWidth = "80px"; textSpan.style.textAlign = "center";
        widget.appendChild(textSpan);
        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'widget-btn';
        pauseBtn.innerHTML = '⏸';
        pauseBtn.onclick = () => stopScrollMode(false);
        widget.appendChild(pauseBtn);
        document.body.appendChild(widget);
    }
}

function render(html) {
    const overlay = document.getElementById('scroll-guard-overlay');
    overlay.innerHTML = html;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// --- 7. DASHBOARD ---
function showDashboard() {
    stopScrollMode(false); 
    const totalQ = user.stats.questionsAnswered || 0;
    const totalWrong = user.stats.wrongAnswers || 0;
    const totalCorrect = totalQ - totalWrong;
    let accuracy = 0;
    if (totalQ > 0) accuracy = Math.round((totalCorrect / totalQ) * 100);
    const rank = getRank(user.points);

    render(`
        <div class="sg-card">
            <h2 style="color:#4cc9f0; margin-bottom:5px;">Student Profile</h2>
            <div style="text-align:center; margin-bottom:20px;">
                <span style="background:rgba(255,255,255,0.1); padding:5px 10px; border-radius:15px; font-size:0.85rem; color:#aaa;">${user.domain.toUpperCase()} TRACK</span>
            </div>
            <div style="text-align:left; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                <div><h3 style="margin:0; font-size:1.4rem;">${user.name}</h3><p style="margin:5px 0 0 0; color:#f72585; font-weight:bold;">${rank}</p></div>
                <div style="text-align:right;"><span style="font-size:2rem; font-weight:bold; color:#fff;">${user.points}</span><p style="margin:0; font-size:0.8rem; color:#aaa;">PTS</p></div>
            </div>
            <div class="stat-grid">
                <div class="stat-box"><div class="stat-val" style="color:#22c55e">${currentTopicIndex}</div><div class="stat-label">Topics Mastered</div></div>
                <div class="stat-box"><div class="stat-val">${totalQ}</div><div class="stat-label">Total Questions</div></div>
                <div class="stat-box"><div class="stat-val">${accuracy}%</div><div class="stat-label">Global Accuracy</div></div>
                <div class="stat-box"><div class="stat-val" style="color:#ef4444">${totalWrong}</div><div class="stat-label">Total Mistakes</div></div>
            </div>
            <button class="primary-btn" id="dash-back">Back to Learning</button>
        </div>
    `);
    document.getElementById('dash-back').onclick = showChoice;
}

// --- 8. LOGIN ---
function showLogin(isReturning) {
    render(`
        <div class="sg-card">
            <h2>ScrollGuard</h2>
            <p style="color:#aaa;">${isReturning ? 'Welcome Back!' : 'Start Learning'}</p>
            ${!isReturning ? `
                <input type="text" id="sg-name" placeholder="Name" required>
                <select id="sg-domain"><option value="python">Python</option><option value="java">Java</option></select>` : ''}
            <input type="password" id="sg-pass" placeholder="Password">
            <p id="sg-error" style="color:#ef4444; font-size:0.9rem;"></p>
            <button id="login-btn" class="primary-btn">${isReturning ? 'Login' : 'Create Profile'}</button>
        </div>
    `);
    document.getElementById('login-btn').onclick = () => {
        const pass = document.getElementById('sg-pass').value;
        if (!pass) return;
        if (isReturning) {
            if (hashPassword(pass) === user.password) showChoice();
            else document.getElementById('sg-error').innerText = "Wrong Password";
        } else {
            const name = document.getElementById('sg-name').value || 'User';
            const domain = document.getElementById('sg-domain').value;
            user = { name, domain, password: hashPassword(pass), points: 0, stats: { questionsAnswered: 0, totalTime: 0, wrongAnswers: 0 } };
            DB_TOPICS = domain === 'java' ? DB_TOPICS_JAVA : DB_TOPICS_PYTHON;
            chrome.storage.local.set({ sgUser: user, sgTopicIndex: 0 });
            showChoice();
        }
    };
}

// --- 9. VIDEO CHOICE (SPLIT LOGIC: INSTA VS YOUTUBE) ---
function showChoice() {
    if (currentTopicIndex >= DB_TOPICS.length) {
        showCourseCompletion();
        return;
    }

    const topic = DB_TOPICS[currentTopicIndex];
    const vidUrl = isReteachMode ? topic.video_reteach : topic.video_main;
    
    // DETECT PLATFORM
    const isInstagram = location.href.includes("instagram.com");

    let videoContent = '';
    
    if (isInstagram) {
        // INSTAGRAM: Show embedded iframe (Original Behavior)
        videoContent = `
            <div class="video-wrapper">
                <iframe src="${vidUrl}" allow="autoplay" allowfullscreen></iframe>
            </div>
            <button id="start-btn" class="primary-btn">Start Quiz</button>
        `;
    } else {
        // YOUTUBE: Show Redirect Button (New Focus Mode Behavior)
        videoContent = `
            <div style="margin: 30px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <p>⚠️ Learning Mode Active</p>
                <p>We will redirect you to the learning video in <strong>Focus Mode</strong>.</p>
            </div>
            <button id="start-btn" class="primary-btn">▶️ Watch Video</button>
        `;
    }

    render(`
        <div class="sg-card">
            <div style="display:flex; justify-content:space-between; color:#aaa; font-size:0.9rem;">
                <span>${user.domain.toUpperCase()}</span>
                <span style="color:${user.points>0?'#22c55e':'#ef4444'}">${user.points} PTS</span>
            </div>
            <h3 style="color:${isReteachMode?'#f72585':'#4cc9f0'}">
                ${isReteachMode ? '⚠️ Remedial Mode' : '🚀 Learning Mode'}
            </h3>
            <h1 style="font-size:1.5rem;">${topic.name}</h1>
            
            ${videoContent}
        </div>
    `);
    
    stopAllVideos();
    
    // Attach listener based on platform
    document.getElementById('start-btn').onclick = () => {
        if (isInstagram) {
            runQuiz(topic); // Direct Quiz on Insta
        } else {
            startLearningRedirect(topic); // Redirect on YouTube
        }
    };
}

// --- 10. QUIZ LOGIC ---
async function runQuiz(topic) {
    render(`<div class="sg-card"><h2>Loading Questions...</h2></div>`);
    const questions = await getQuizForTopic(topic, isReteachMode);
    let qIndex = 0;
    let score = 0;
    sessionPenalties = 0;
    const requiredScore = isReteachMode ? 2 : 3;

    function renderQuestion() {
        if (qIndex >= questions.length) { finishQuiz(questions.length, score, requiredScore); return; }
        const q = questions[qIndex];
        questionStartTime = Date.now(); 
        render(`
            <div class="sg-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <span>Q ${qIndex + 1}/${questions.length}</span><span style="color:${score>0?'#4cc9f0':'#fff'}">Score: ${score}</span>
                </div>
                <p class="question-text">${q.q}</p>
                <div class="options-grid">${q.o.map((opt, i) => `<button class="opt-btn" id="opt-${i}">${opt}</button>`).join('')}</div>
                <div id="expl-box" style="display:none; margin-top:15px; text-align:left; font-size:0.9rem; padding:10px; border-left:3px solid #fff; background:rgba(255,255,255,0.05);"></div>
                <button id="next-btn" class="primary-btn" style="display:none; margin-top:10px;">Next</button>
            </div>
        `);
        q.o.forEach((_, i) => {
            document.getElementById(`opt-${i}`).onclick = function() {
                const timeTaken = (Date.now() - questionStartTime) / 1000;
                user.stats.questionsAnswered++; user.stats.totalTime += timeTaken;
                document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
                const isCorrect = (i === q.a);
                const expl = document.getElementById('expl-box');
                const next = document.getElementById('next-btn');
                if (isCorrect) {
                    this.style.background = 'rgba(34, 197, 94, 0.5)'; this.style.borderColor = '#22c55e';
                    score++; expl.innerHTML = `✅ <strong>Correct!</strong><br>${q.e}`; expl.style.borderLeftColor = '#22c55e';
                } else {
                    this.style.background = 'rgba(239, 68, 68, 0.5)'; this.style.borderColor = '#ef4444';
                    document.getElementById(`opt-${q.a}`).style.background = 'rgba(34, 197, 94, 0.3)';
                    user.points = Math.max(0, user.points - 2); sessionPenalties += 2; user.stats.wrongAnswers++;
                    expl.innerHTML = `❌ <strong>Wrong! (-2 PTS)</strong><br>${q.e}`; expl.style.borderLeftColor = '#ef4444';
                }
                expl.style.display = 'block'; next.style.display = 'block';
                next.innerText = (qIndex === questions.length - 1) ? "See Results" : "Next";
                saveUserData();
            };
        });
        document.getElementById('next-btn').onclick = () => { qIndex++; renderQuestion(); };
    }
    renderQuestion();
}

// --- 11. FINISH SCREEN ---
function finishQuiz(total, score, required) {
    const passed = score >= required;
    const correctPoints = score * 3;
    const penaltyPoints = sessionPenalties; 
    const netGain = correctPoints - penaltyPoints;
    
    if (passed) {
        user.points += netGain;
        currentTopicIndex++;
        isReteachMode = false;
        saveUserData();

        if (currentTopicIndex >= DB_TOPICS.length) {
            showCourseCompletion();
            return;
        }
        
        render(`
            <div class="sg-card">
                <h1 style="color:#4cc9f0">🎉 Passed!</h1>
                <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:8px; margin:15px 0; text-align:left;">
                    <div style="display:flex; justify-content:space-between;"><span>Correct (${score} × 3):</span> <span style="color:#22c55e">+${correctPoints}</span></div>
                    <div style="display:flex; justify-content:space-between; color:#ef4444;"><span>Penalties:</span> <span>-${penaltyPoints}</span></div>
                    <hr style="border:0; border-top:1px solid rgba(255,255,255,0.3); margin:5px 0;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;"><span>Net Profit:</span> <span style="color:${netGain>=0?'#4cc9f0':'#ef4444'}">${netGain>=0?'+':''}${netGain} PTS</span></div>
                </div>
                <p style="margin-bottom:20px; color:#aaa;">Total Balance: ${user.points} PTS</p>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button id="btn-spend" class="primary-btn">🔓 Unlock Scroll</button>
                    <button id="btn-save" class="secondary-btn">💰 Save & Next Topic</button>
                    <button id="btn-dash" class="secondary-btn" style="border-color:#aaa; color:#aaa;">👤 View Profile</button>
                </div>
            </div>
        `);
        document.getElementById('btn-spend').onclick = startScrollMode;
        document.getElementById('btn-save').onclick = showChoice;
        document.getElementById('btn-dash').onclick = showDashboard;
    } else {
        user.points = Math.max(0, user.points - 5); 
        isReteachMode = true;
        saveUserData();
        render(`
            <div class="sg-card">
                <h1 style="color:#f72585">❌ Failed</h1>
                <p>Score: ${score}/${total} | Needed: ${required}</p>
                <div style="background:rgba(255,50,50,0.1); padding:10px; border-radius:8px; margin:10px 0; text-align:left; font-size:0.9rem;">
                   <p style="margin:0;">• Penalties: -${penaltyPoints} pts</p>
                   <p style="margin:5px 0 0 0;">• Fail Fine: -5 pts</p>
                </div>
                <p style="font-weight:bold; color:#ef4444">Total Lost: -${penaltyPoints + 5} PTS</p>
                <button id="btn-retry" class="secondary-btn">Enter Remedial Mode</button>
                <button id="btn-dash" class="secondary-btn" style="margin-top:10px; border-color:#aaa; color:#aaa;">👤 View Profile</button>
            </div>
        `);
        document.getElementById('btn-retry').onclick = showChoice;
        document.getElementById('btn-dash').onclick = showDashboard;
    }
}

// --- 11.5 COURSE COMPLETION (Smart Suggestion) ---
function showCourseCompletion() {
    const isPython = user.domain === 'python';
    const nextDomain = isPython ? 'java' : 'python';
    const nextDomainTitle = isPython ? 'Full Stack Java' : 'Python for Data Science';
    const nextDB = isPython ? DB_TOPICS_JAVA : DB_TOPICS_PYTHON;

    render(`
        <div class="sg-card">
            <h1 style="color:#ffd700; font-size: 2.5rem;">🏆</h1>
            <h2 style="color:#4cc9f0">Course Completed!</h2>
            <p>You have mastered <strong>${user.domain.toUpperCase()}</strong>.</p>
            
            <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; border: 1px solid #4cc9f0;">
                <p style="color:#aaa; font-size:0.9rem; margin-bottom:10px;">AI RECOMMENDATION</p>
                <h3 style="margin:0;">${nextDomainTitle}</h3>
                <p style="font-size:0.9rem;">Based on your performance, this is your optimal next step.</p>
            </div>

            <button id="btn-switch-course" class="primary-btn">Start ${nextDomain.toUpperCase()} Track</button>
            <button id="btn-unlock-reward" class="secondary-btn">🔓 Unlock Scroll (Reward)</button>
        </div>
    `);

    document.getElementById('btn-switch-course').onclick = () => {
        user.domain = nextDomain;
        currentTopicIndex = 0;
        DB_TOPICS = nextDB;
        isReteachMode = false;
        saveUserData();
        showChoice();
    };

    document.getElementById('btn-unlock-reward').onclick = startScrollMode;
}

function saveUserData() {
    chrome.storage.local.set({ sgUser: user, sgTopicIndex: currentTopicIndex, sglsReteachMode: isReteachMode });
}

// --- 12. SCROLL MODE ---
function startScrollMode() {
    isScrolling = true;
    document.getElementById('scroll-guard-overlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('sg-timer').style.display = 'flex';
    if (scrollObserver) clearInterval(scrollObserver);
    scrollObserver = setInterval(handleScrollLoop, 300); 
    currentUrl = location.href;
    updateTimerUI();
    window.addEventListener('keydown', handleKeyScroll);
}

function handleKeyScroll(e) {
    if (!isScrolling) return;
    const isReels = location.href.includes('/reel') || location.href.includes('/shorts/');
    if (isReels && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        const now = Date.now();
        if (now - lastKeyTime > 800) { deductPoint(); lastKeyTime = now; }
    }
}

function deductPoint() {
    user.points--; flashTimer(); saveUserData();
    if (user.points <= 0) stopScrollMode(true);
}

function handleScrollLoop() {
    if (!isScrolling) return;
    if (user.points <= 0) { stopScrollMode(true); return; }

    const isReels = location.href.includes('/reel') || location.href.includes('/shorts/');
    if (isReels) {
        if (location.href !== currentUrl) { deductPoint(); currentUrl = location.href; }
    } else {
        const now = Date.now();
        if (!window.lastTick || now - window.lastTick >= 1000) {
            timeUntilDeduction--; window.lastTick = now; updateTimerUI(); 
            if (timeUntilDeduction <= 0) { deductPoint(); timeUntilDeduction = 60; }
        }
    }
}

function stopScrollMode(lockout = false) {
    isScrolling = false;
    clearInterval(scrollObserver);
    window.removeEventListener('keydown', handleKeyScroll);
    document.getElementById('sg-timer').style.display = 'none';
    showChoice(); 
}

function updateTimerUI() {
    if (isFlashing) return;
    const textEl = document.getElementById('sg-timer-text');
    const container = document.getElementById('sg-timer');
    if (!textEl) return;
    const isReels = location.href.includes('/reel') || location.href.includes('/shorts/');
    if (isReels) textEl.innerText = `${user.points} pts`;
    else textEl.innerText = `${user.points} (${timeUntilDeduction}s)`;
    if (user.points < 10) container.style.borderColor = 'red';
    else container.style.borderColor = '#f72585';
}

function flashTimer() {
    isFlashing = true;
    const el = document.getElementById('sg-timer');
    const textEl = document.getElementById('sg-timer-text');
    if (el && textEl) {
        el.classList.add('pulse');
        const originalColor = textEl.style.color;
        textEl.innerText = "-1 PT"; textEl.style.color = "#ef4444"; 
        setTimeout(() => { el.classList.remove('pulse'); textEl.style.color = originalColor || "white"; isFlashing = false; updateTimerUI(); }, 600);
    }
}
