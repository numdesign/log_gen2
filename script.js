// --- 상수 및 설정 (V.1.4) ---
const PRESET_STORAGE_KEY = "chatLogPresets_v30" // 버전업
const AUTOSAVE_PREFIX = "autoSavedChat_v30_" // 버전업
const USER_MODIFIED_COLOR_FLAG = "userModifiedLogColors_v30" // 버전업
let DEFAULT_SETTINGS = {
  characterName: "",
  modelName: "",
  promptName: "",
  assistModelName: "",
  userName: "USER",
  chatNumber: "",
  characterImageUrl: "",
  useCharacterImage: true,
  backgroundColor: "#ffffff",
  textColor: "#1d2129",
  highlightColor: "#3498db",
  promptColor: "#6c757d",
  emphasisColor: "#1f618d",
  baseFontSize: 15,
  titleFontSize: 38,
  containerWidth: 650,
  logSectionRadius: 12,
  lineHeight: 1.6,
  letterSpacing: -0.05,
  italicizeNarration: true,
  simpleOutputMode: false,
  disableChatLogCollapse: false,
  isAutoInputMode: true, // false: prefix, true: auto
  dialogueUseBubble: true,
  narrationUseLine: true,
  showBriefHeaderInfo: false
}
const colorThemes = {
  /* 기존과 동일 */ ocean_blue: {
    h: "#2980b9",
    p: "#5dade2",
    e: "#1a5276",
  },
  forest_green: { h: "#27ae60", p: "#58d68d", e: "#1e8449" },
  royal_purple: { h: "#8e44ad", p: "#bb8fce", e: "#6c3483" },
  sunset_orange: { h: "#e67e22", p: "#f5b041", e: "#a04000" },
  ruby_red: { h: "#c0392b", p: "#f1948a", e: "#922b21" },
  teal_green: { h: "#16a085", p: "#48c9b0", e: "#0e6655" },
  graphite: { h: "#566573", p: "#aeb6bf", e: "#34495e" },
  indigo_amber: { h: "#34495e", p: "#7f8c8d", e: "#d35400" },
  lavender_mint: { h: "#9b59b6", p: "#a569bd", e: "#1abc9c" },
  rose_plum: { h: "#d9534f", p: "#ec7063", e: "#8e44ad" },
}
// colorThemes 접근 시 단축키 사용 (h:highlightColor, p:promptColor, e:emphasisColor)

// --- 유틸리티 함수 (기존과 동일) ---
function adjustColor(color, amount) {
  let u = false
  if (color.startsWith("#")) {
    color = color.slice(1)
    u = true
  }
  let n = parseInt(color, 16)
  if (isNaN(n)) return u ? "#000000" : "000000"
  let r = (n >> 16) + amount
  r = Math.max(0, Math.min(255, r))
  let b = ((n >> 8) & 0x00ff) + amount
  b = Math.max(0, Math.min(255, b))
  let g = (n & 0x0000ff) + amount
  g = Math.max(0, Math.min(255, g))
  return (
    (u ? "#" : "") +
    ((r << 16) | (b << 8) | g).toString(16).padStart(6, "0")
  )
}
function getCurrentDate() {
  const n = new Date()
  return `${n.getFullYear()}.${String(n.getMonth() + 1).padStart(2, "0")}.${String(n.getDate()).padStart(2, "0")}`
}

// --- HTML 생성 함수 (V.1.4 - 파싱/렌더링/스타일 수정) ---
function formatChatToHTML(chatTexts, settings) {
  console.log("formatChatToHTML 시작됨. 설정:", settings)
  const {
    characterName = "?",
    modelName = "?",
    promptName = "?",
    assistModelName = "?",
    userName = "USER",
    chatNumber,
    characterImageUrl = "",
    useCharacterImage = true,
    backgroundColor = "#ffffff",
    textColor = "#1d2129",
    highlightColor = "#3498db",
    promptColor = "#6c757d",
    emphasisColor = "#1f618d",
    baseFontSize = 15,
    titleFontSize = 38,
    containerWidth = 650,
    logSectionRadius = 12,
    lineHeight = 1.6,
    letterSpacing = 0,
    italicizeNarration = true,
    simpleOutputMode = false,
    disableChatLogCollapse = false,
    isAutoInputMode = false,
    dialogueUseBubble = true,
    narrationUseLine = true,
    showBriefHeaderInfo = false
  } = settings // 기본값 일부 변경
  const chatNum = chatNumber || Math.floor(Math.random() * 900) + 100
  const bgColorIsDark = parseInt(backgroundColor.slice(1), 16) < 0x888888
  const elementBgColor = adjustColor(
    backgroundColor,
    bgColorIsDark ? +5 : -5,
  )
  const darkElementBgColor = adjustColor(
    backgroundColor,
    bgColorIsDark ? +10 : -10,
  )
  const narrationColor = adjustColor(textColor, bgColorIsDark ? -30 : +30)
  const messageTextColor = textColor
  const borderColor = adjustColor(
    elementBgColor,
    bgColorIsDark ? +15 : -15,
  )

  function processEmphasis(text) {
    if (!text) return ""
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    text = text.replace(
      /\*\*\*(.*?)\*\*\*/g,
      '<strong style="font-style: italic;">$1</strong>',
    )
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    text = text.replace(
      /(?<![a-zA-Z0-9*])\*(?![* ])(.*?)(?<![ *])\*(?![a-zA-Z0-9*])/g,
      '<em style="font-style: italic;">$1</em>',
    )
    text = text.replace(
      /\$(.*?)\$/g,
      `<span style="background-color: ${emphasisColor}; color: #ffffff; padding: 0 2px; border-radius: 3px;">$1</span>`,
    )
    text = text.replace(
      /\^(.*?)\^/g,
      `<span style="background-color: ${highlightColor}; color: #ffffff; padding: 0 2px; border-radius: 3px;">$1</span>`,
    )
    text = text.replace(/\n/g, "<br>")
    return text
  }

  const currentDate = getCurrentDate()
  let html = `<div style="width: 100%; max-width: ${containerWidth}px; margin: 10px auto; background-color: ${backgroundColor}; border-radius: 0; overflow: hidden; font-family: 'Pretendard', Arial, sans-serif; letter-spacing: -0.03em; color: ${textColor}; border: 1px solid ${borderColor}; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">`

  if (!simpleOutputMode) {
    /* 헤더 생성 */
     let headerInfoSpanContent = ''
    if (showBriefHeaderInfo) { // 토글이 켜져 있으면
      const styledNameParts = []
      const getQuoteLineStyle = (color) => {
          const validColor = color || '#888888' // 색상값이 없으면 연한 회색으로 대체
          // 사용자가 원하는 스타일 적용
          const styleString = `
            display: inline-block; background-color: ${validColor}; padding:0.1em 0.3em; border: 1px solid ${adjustColor(validColor, -10)};`
          // 스타일 문자열 내 공백 정리
          return styleString.replace(/\s+/g, ' ').trim()
      }
      if (modelName) {
          const style = getQuoteLineStyle(highlightColor)
          styledNameParts.push(`<span style="${style}">${modelName}</span>`)
      }
      if (promptName) {
          const style = getQuoteLineStyle(promptColor);
          styledNameParts.push(`<span style="${style}">${promptName}</span>`)
      }
      if (assistModelName) {
          const style = getQuoteLineStyle(emphasisColor);
          styledNameParts.push(`<span style="${style}">${assistModelName}</span>`)
      }
      if (styledNameParts.length > 0) {
          const joinedStyledNames = styledNameParts.join('&ensp;'); // HTML 조각들을 ' / '로 연결
          const outerSpanStyle = `font-size: 11px; font-weight: 400; color:#fff; line-height:1; letter-spacing:0em`
          headerInfoSpanContent = `<span style="${outerSpanStyle}">${joinedStyledNames}</span>`
          }
  } else { // 토글이 꺼져 있을 때
    headerInfoSpanContent = `#${chatNum}`
  }
    html += `<div style="background-color: ${elementBgColor}; padding: 32px 40px; border-bottom: 1px solid ${borderColor};"> <div style="display: block; margin-bottom: 8px; text-align: left;"> <span style="font-size: 14px; color: ${narrationColor}; font-weight: 500;">${headerInfoSpanContent || '&nbsp;'}</span> </div> <h1 style="font-size: ${titleFontSize}px; margin: 0; font-weight: 700; color: ${textColor}; line-height: 1.2;">CHAT LOG</h1> </div>`
     /* 캐릭터 정보 섹션 */
    html += `<div class="log-section character-info" style="background-color: ${elementBgColor}; margin: 16px 20px; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor}; padding: 32px;"> <div style="width: 100%; display: block; text-align: center;">`
    /* 캐릭터 이미지 출력 */
    if (useCharacterImage) { // 이미지를 사용하도록 설정된 경우에만 실행
      if (characterImageUrl) { // URL이 있으면 이미지 태그 생성
        html += `<img src="${characterImageUrl.replace(/"/g, "&quot;")}" alt="${characterName.replace(/"/g, "&quot;")}" style="max-width: 150px; max-height: 150px; border-radius: 50%; margin: 0 auto 15px auto; display: block; border: 3px solid ${borderColor}; object-fit: cover;">`
      } else { // URL이 없으면 플레이스홀더 영역 생성
        html += `<div style="font-size: 12px; color: ${narrationColor}; padding: 20px 10px; line-height: 1.4; margin: 15px auto; text-align: center;">이 문구를 지우고 이미지를 삽입해주세요</div>`
      }
    }
    /* 메시지 헤더 */
    html += `<h2 style="font-size: 28px; color: ${textColor}; margin: 0 0 6px 0; font-weight: 700; border: none; padding: 0;">${characterName}</h2> <div style="margin: 8px 0; font-size: ${baseFontSize}px; color: ${messageTextColor}; display: block; text-align: center;">`
    if (!showBriefHeaderInfo) {
      html += `<div style="margin: 8px 0; font-size: ${baseFontSize}px; color: ${messageTextColor}; display: block; text-align: center;">`
       if (modelName)
          html += `<span style="display: inline-block; background-color: ${highlightColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(highlightColor, -10)}; margin: 0 5px 10px;">${modelName}</span>`
       if (promptName)
          html += `<span style="display: inline-block; background-color: ${promptColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(promptColor, -10)}; margin: 0 5px 10px;">${promptName}</span>`
       if (assistModelName)
          html += `<span style="display: inline-block; background-color: ${emphasisColor}; padding: 6px 10px; border-radius: 6px; font-weight: 500; color: #ffffff; text-align: center; border: 1px solid ${adjustColor(emphasisColor, -10)}; margin: 0 5px 10px;">${assistModelName}</span>`
    html += `</div>`
    }
    html += `</div></div></div>`
    html += `<div class="log-section conversation-header" style="background-color: ${elementBgColor}; margin: 0 20px 16px; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor}; padding: 20px 32px;"> <div style="font-size: 12px; font-weight: 600; color: ${narrationColor}; margin-bottom: 4px;">MONO</div> <div style="font-size: 20px; font-weight: 700; color: ${textColor};">CONVERSATION</div> </div>`
  }

  console.log("--- 채팅 내용 처리 시작 ---")
  chatTexts.forEach((chatText, index) => {
    console.log(`[ 섹션 ${index + 1} ] 원본 길이:`, chatText?.length)
    if (!chatText?.trim() && chatTexts.length > 1 && index > 0) {
      console.log(`[ 섹션 ${index + 1} ] skip`)
      return
    }
    const lines = chatText.trim().split("\n")
    const chatParts = []

    if (isAutoInputMode) {
      // 자동 인식(사칭방지용)
      console.log(`[ 섹션 ${index + 1} ] 자동 인식(사칭방지용) 모드 파싱`)
      let cp = null // currentPart
      for (let i = 0; i < lines.length; i++) {
        let l = lines[i].trim()
        if (!l) {
          if (cp && cp.content.length > 0) {
            chatParts.push({
              type: cp.type,
              content: cp.content.join("\n"),
            })
            console.log(`   -> 이전 ${cp.type} 저장 (빈 줄)`)
            cp = null
          }
          continue
        }
        let lt = "narration"
        let lc = l
        // *** Regex 수정: 다양한 따옴표 허용 및 내용 추출 ***
        const dm = l.match(/^["“](.*?)["”]$/) // Non-greedy match inside quotes
        if (dm) {
          lt = "dialogue"
          lc = dm[1]
          console.log(`  [${i + 1}] 대사: "${lc}"`)
        } else {
          console.log(`  [${i + 1}] 나레: "${lc}"`)
        }
        if (!cp || cp.type !== lt) {
          if (cp && cp.content.length > 0) {
            chatParts.push({
              type: cp.type,
              content: cp.content.join("\n"),
            })
            console.log(`   -> 이전 ${cp.type} 저장`)
          }
          cp = { type: lt, content: [lc] }
          console.log(`   -> 새 ${lt} 시작`)
        } else {
          cp.content.push(lc)
          console.log(`   -> ${lt} 추가`)
        }
      }
      if (cp && cp.content.length > 0) {
        chatParts.push({ type: cp.type, content: cp.content.join("\n") })
        console.log(`  [종료] 마지막 ${cp.type} 저장`)
      }
    } else {
      // 접두사(풀사칭용)
      console.log(`[ 섹션 ${index + 1} ] 접두사(풀사칭용) 모드 파싱`)
      let cs = null
      let cc = [] // currentSpeaker, currentContent
      for (let i = 0; i < lines.length; i++) {
        let l = lines[i].trim()
        if (!l) {
          if (cs && cc.length > 0) {
            chatParts.push({ type: cs, content: cc.join("\n") })
            console.log(`      -> 이전 ${cs} 저장 (빈 줄)`)
            cc = []
          }
          cs = null
          console.log(`     -> 빈 줄 skip`)
          continue
        }
        const um = l.match(/^USER:\s*(.*)/i)
        const am = l.match(/^AI:\s*(.*)/i)
        const nm = l.match(/^([\*\-])\s*(.*)/)
        let st = null
        let ct = null
        if (um) {
          st = "user"
          ct = um[1]
        } else if (am) {
          st = "ai"
          ct = am[1]
        } else if (
          nm &&
          !l.startsWith("**") &&
          !l.startsWith("***") &&
          !l.startsWith("$") &&
          !l.startsWith("^")
        ) {
          st = "narration"
          ct = nm[2] || ""
        }
        if (st) {
          if (cs && cc.length > 0) {
            chatParts.push({ type: cs, content: cc.join("\n") })
            console.log(`      -> 이전 ${cs} 저장`)
          }
          cs = st
          cc = ct ? [ct] : []
          console.log(`      -> 새 ${st} 시작`)
        } else {
          if (cs) {
            cc.push(l)
            console.log(`    -> ${cs} 추가`)
          } else if (
            chatParts.length > 0 &&
            chatParts[chatParts.length - 1].type === "narration"
          ) {
            chatParts[chatParts.length - 1].content += "\n" + l
            console.log(`    -> 이전 나레 추가`)
          } else {
            chatParts.push({ type: "narration", content: l })
            console.log(`    -> 기본 나레 처리`)
            cs = "narration"
            cc = []
          }
        }
      }
      if (cs && cc.length > 0) {
        chatParts.push({ type: cs, content: cc.join("\n") })
        console.log(`  [종료] 마지막 ${cs} 저장`)
      }
    }
    console.log(
      `[ 섹션 ${index + 1} ] 파싱 결과:`,
      JSON.stringify(chatParts),
    )

    if (chatParts.length > 0) {
      // HTML 렌더링
      const fm = simpleOutputMode && index === 0 ? "20px" : "0" // firstMargin
      const ct = disableChatLogCollapse ? "div" : "details" // containerTag
      const st = disableChatLogCollapse ? "div" : "summary" // summaryTag
      const da = disableChatLogCollapse ? "" : " open" // detailsOpenAttribute
      const sc = disableChatLogCollapse
        ? "cursor: default;"
        : "cursor: pointer;" // summaryCursorStyle

      html += `<div class="log-section chat-entry" style="margin: ${fm} 20px 16px; background-color: ${elementBgColor}; border-radius: ${logSectionRadius}px; overflow: hidden; border: 1px solid ${borderColor};">`
      html += `<${ct}${da} style="padding: 0;">` // 컨테이너 시작 (내부 패딩 없음)

      // 제목 (div/summary) - 패딩 적용, disable 시 테두리 추가
      const ts = `padding: 15px 25px; list-style:none; outline: none; font-size: 20px; font-weight: 700; color: ${textColor}; display: block; ${sc}` // titleStyle
      // *** 수정: disable 시 하단 테두리 추가 ***
      const tb = disableChatLogCollapse
        ? `border-bottom: 1px solid ${borderColor};`
        : "" // titleBorder
      html += `<${st} style="${ts} ${tb}">CHAT LOG ${index + 1}</${st}>`

      // 내용 컨테이너 (div) - 패딩 및 배경색 항상 적용, radius는 조건부
      const cp = "padding: 15px 25px;" // contentPadding
      // *** 수정: 배경색 항상 적용 ***
      const cb = `background-color: ${backgroundColor};` // contentBackground
      const cr = disableChatLogCollapse
        ? ""
        : `border-radius: 0 0 ${logSectionRadius - 1}px ${logSectionRadius - 1}px;` // contentRadius
      html += `<div style="${cp} ${cb} ${cr}">` // 내용 컨테이너 시작

      console.log(`  [ 섹션 ${index + 1} ] HTML 렌더링 시작...`)
      chatParts.forEach((part, partIndex) => {
        const pc = processEmphasis(part.content) // processedContent
        if (part.type === "narration") {
          const pc = processEmphasis(part.content)
          const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em; ${italicizeNarration ? "font-style: italic;" : ""}`
            if (narrationUseLine) { // --- 인용선 사용 시 HTML ---
              html += `<div style="margin: 16px 0; display: block; border-left: 3px solid ${highlightColor}; padding-left: 16px;"> <div style="${textStyle}">${pc || "&nbsp;"}</div> </div>`
            } else { // --- 인용선 미사용 시 HTML ---
              html += `<div style="margin: 16px 0; display: block; padding-left: 0;"> <div style="${textStyle}">${pc || "&nbsp;"}</div> </div>`
          }
        } else if (part.type === "user") {
          const pc = processEmphasis(part.content); // 유저 이름 표시 부분
          const userNameDisplay = `<div style="font-weight: 600; color: ${textColor}; margin-bottom: 8px; font-size: 14px; text-align: right;">${userName}</div>`
          const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`
          if (dialogueUseBubble) { // --- 말풍선 사용 시 HTML ---
            html += `<div style="margin: 32px 0; text-align: right;"> <div style="max-width: 75%; display: inline-block; text-align: left;"> ${userNameDisplay} <div style="background-color: ${darkElementBgColor}; border-radius: 12px; padding: 10px 20px; border: 1px solid ${borderColor}; ${textStyle};">${pc || "&nbsp;"}</div> </div> </div>`
          } else { // --- 말풍선 미사용 시 HTML (예시: 오른쪽 선 + 간단한 패딩) ---
            html += `<div style="margin: 32px 0; text-align: right;"> <div style="max-width: 75%; display: inline-block; text-align: right;"> ${userNameDisplay} <div style="display: inline-block; text-align: left; background-color: ${darkElementBgColor}; border-right: 3px solid ${emphasisColor}; padding: 10px 20px; ${textStyle};">${pc || "&nbsp;"}</div> </div> </div>`
          }
        } else if (part.type === "ai") {
          const pc = processEmphasis(part.content) // 캐릭터 이름 표시 부분
          const characterNameDisplay = `<div style="font-weight: 600; color: ${textColor}; margin-bottom: 8px; font-size: 14px;">${characterName}</div>`
          const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`
          if (dialogueUseBubble) { // --- 말풍선 사용 시 HTML ---
            html += `<div style="margin: 32px 0; text-align: left;"> <div style="max-width: 75%; display: inline-block;"> ${characterNameDisplay} <div style="background-color: ${backgroundColor}; border-radius: 12px; padding: 10px 20px; border: 1px solid ${highlightColor}; ${textStyle};">${pc || "&nbsp;"}</div> </div> </div>`
          } else { // --- 말풍선 미사용 시 HTML ---
            html += `<div style="margin: 32px 0; text-align: left;"> <div style="max-width: 75%; display: inline-block;"> ${characterNameDisplay} <div style="display: inline-block; background-color: ${darkElementBgColor}; border-left: 3px solid ${emphasisColor}; padding: 10px 20px; ${textStyle};">${pc || "&nbsp;"}</div> </div> </div>`
          }
        } else if (part.type === "dialogue") {
          const pc = processEmphasis(part.content)
          const textStyle = `font-size: ${baseFontSize}px; color: ${narrationColor}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}em;`
          if (dialogueUseBubble) { // --- 말풍선 사용 시 HTML ---
            html += `<div style="margin: 32px 0; text-align: left;"> <div style="display: inline-block; background-color: ${darkElementBgColor}; border-radius: 12px; padding: 10px 20px; ${textStyle};">${pc || "&nbsp;"}</div> </div>`;
          } else { // --- 말풍선 미사용 시 HTML (예시: 왼쪽 선 + 간단한 패딩) ---
            html += `<div style="margin: 32px 0; text-align: left;"> <div style="display: inline-block; border-left: 3px solid ${emphasisColor}; background-color: ${darkElementBgColor}; padding: 5px 16px; ${textStyle};">${pc || "&nbsp;"}</div> </div>`;
          }
        } // 자동인식 대사 (배경=기본배경, 테두리 없음)
      })
      html += `</div>` // 내용 컨테이너 닫기
      html += `</${ct}>` // 컨테이너 닫기
      html += `</div>` // chat-entry 닫기
    } else {
      console.log(`  [ 섹션 ${index + 1} ] 처리할 chatParts 없음`)
    }
  })

  console.log("--- 채팅 내용 처리 종료 ---")
  html += `<div style="background-color: ${elementBgColor}; padding: 24px 40px; text-align: right; font-size: 13px; color: ${narrationColor}; border-top: 1px solid ${borderColor};"> <div style="display: inline-block; margin-right: 20px;">CHAT LOG | ${characterName || "Log"}</div> <div style="display: inline-block;">${currentDate}</div> </div>`
  html += `</div>` // 전체 래퍼 닫기
  console.log("formatChatToHTML 종료됨.")
  return html
}

// --- 마크다운 / 접두사 적용 헬퍼 함수 (기존과 동일) ---
function applyMarkdown(textarea, markdownType) {
  if (!textarea) return
  const s = textarea.selectionStart,
    e = textarea.selectionEnd,
    st = textarea.value.substring(s, e)
  let p = "",
    x = ""
  switch (markdownType) {
    case "bold":
      p = "**"
      x = "**"
      break
    case "italic":
      p = "*"
      x = "*"
      break
    case "boldItalic":
      p = "***"
      x = "***"
      break
    case "highlight":
      p = "^"
      x = "^"
      break
    case "emphasis":
      p = "$"
      x = "$"
      break
    default:
      return
  }
  const r = st ? `${p}${st}${x}` : `${p}${x}`
  const cp = s + p.length
  textarea.setRangeText(r, s, e, st ? "select" : "end")
  if (!st) {
    textarea.setSelectionRange(cp, cp)
  }
  textarea.focus()
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
}
function applyPrefix(textarea, prefix) {
  if (!textarea) return
  const s = textarea.selectionStart,
    e = textarea.selectionEnd,
    v = textarea.value
  let ls = v.lastIndexOf("\n", s - 1) + 1
  let le = v.indexOf("\n", e)
  if (le === -1) le = v.length
  const al = v.substring(ls, le).split("\n")
  let nl = []
  let fpl = 0
  al.forEach((l, i) => {
    let cm = l.match(/^([\*\-]\s*|USER:\s*|AI:\s*)/i)
    let lc = cm ? l.substring(cm[0].length) : l
    let ln = prefix + lc
    nl.push(ln)
    if (i === 0) {
      fpl = prefix.length
    }
  })
  const r = nl.join("\n")
  textarea.setRangeText(r, ls, le, "preserve")
  const nc = ls + fpl
  textarea.setSelectionRange(nc, nc)
  textarea.focus()
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
}

// --- 페이지 로드 시 실행 및 이벤트 리스너 설정 ---
document.addEventListener("DOMContentLoaded", function () {
  // --- 요소 가져오기 (V.1.4) ---
  const body = document.body
  const themeToggleCheckbox = document.getElementById(
    "themeToggleCheckbox",
  )
  const themeToggleText = document.getElementById("themeToggleText")
  const resetAllButton = document.getElementById("resetAllButton")
  const characterNameInput = document.getElementById("characterName")
  const modelNameInput = document.getElementById("modelName")
  const promptNameInput = document.getElementById("promptName")
  const assistModelNameInput = document.getElementById("assistModelName")
  const userNameInput = document.getElementById("userName")
  const chatNumberInput = document.getElementById("chatNumber")
  const characterImageUrlInput =
    document.getElementById("characterImageUrl")
  const noCharacterImageToggle = document.getElementById("noCharacterImageToggle")
  const characterImageUrlLabel = document.querySelector('label[for="characterImageUrl"]')
  const bgColorInput = document.getElementById("backgroundColor")
  const bgColorText = document.getElementById("backgroundColorText")
  const textColorInput = document.getElementById("textColor")
  const textColorText = document.getElementById("textColorText")
  const highlightColorInput = document.getElementById("highlightColor")
  const highlightColorText = document.getElementById("highlightColorText")
  const promptColorInput = document.getElementById("promptColor")
  const promptColorText = document.getElementById("promptColorText")
  const emphasisColorInput = document.getElementById("emphasisColor")
  const emphasisColorText = document.getElementById("emphasisColorText")
  const baseFontSizeInput = document.getElementById("baseFontSize")
  const titleFontSizeInput = document.getElementById("titleFontSize")
  const containerWidthInput = document.getElementById("containerWidth")
  const logSectionRadiusInput = document.getElementById("logSectionRadius")
  const lineHeightInput = document.getElementById("lineHeight")
  const letterSpacingInput = document.getElementById("letterSpacing")
  const italicizeNarrationCheckbox =
    document.getElementById("italicizeNarration")
  const simpleOutputCheckbox = document.getElementById("simpleOutputMode")
  const disableChatLogCollapseCheckbox = document.getElementById(
    "disableChatLogCollapse",
  )
  const inputModeToggle = document.getElementById("inputModeToggle") // Toggle 사용
  const dialogueBubbleToggle = document.getElementById("dialogueBubbleToggle")
  const narrationLineToggle = document.getElementById("narrationLineToggle")
  const showBriefHeaderInfoToggle = document.getElementById("showBriefHeaderInfo")
  const presetNameInput = document.getElementById("presetName")
  const savePresetBtn = document.getElementById("savePresetBtn")
  const presetListSelect = document.getElementById("presetList")
  const loadPresetBtn = document.getElementById("loadPresetBtn")
  const deletePresetBtn = document.getElementById("deletePresetBtn")
  const chatSectionsContainer = document.getElementById(
    "chatSectionsContainer",
  )
  const addChatSectionBtn = document.getElementById("addChatSectionBtn")
  const generateButton = document.getElementById("generateButton")
  const loadExampleBtn = document.getElementById("loadExampleBtn")
  const htmlOutput = document.getElementById("htmlOutput")
  const previewArea = document.getElementById("previewArea")
  const copyButton = document.getElementById("copyButton")
  const guideHighlightExample = document.getElementById(
    "guideHighlightExample",
  )
  const guideEmphasisExample = document.getElementById(
    "guideEmphasisExample",
  )
  const guideInputModeSpan = document.getElementById("guideInputMode")
  const guidePrefixSpan = document.getElementById("guidePrefix")
  const guideAutoSpan = document.getElementById("guideAuto")

  // --- 함수 정의 ---
  function updateDefaultSettingsFromCSS() {
    try {
      const c = getComputedStyle(document.documentElement)
      DEFAULT_SETTINGS.backgroundColor = c
        .getPropertyValue("--log-bg-light")
        .trim()
      DEFAULT_SETTINGS.textColor = c
        .getPropertyValue("--log-text-light")
        .trim()
      DEFAULT_SETTINGS.highlightColor = c
        .getPropertyValue("--highlight-color")
        .trim()
      DEFAULT_SETTINGS.promptColor = c
        .getPropertyValue("--secondary-color")
        .trim()
      DEFAULT_SETTINGS.emphasisColor = c
        .getPropertyValue("--emphasis-color")
        .trim()
    } catch (e) {
      console.error(e)
    }
  }
  function getCurrentSettings() {
    const s = { ...DEFAULT_SETTINGS }
    try {
      s.characterName = characterNameInput.value
      s.modelName = modelNameInput.value
      s.promptName = promptNameInput.value
      s.assistModelName = assistModelNameInput.value
      s.userName = userNameInput.value || DEFAULT_SETTINGS.userName
      s.chatNumber = chatNumberInput.value
      s.characterImageUrl = characterImageUrlInput.value
      s.useCharacterImage = !noCharacterImageToggle.checked
      s.backgroundColor = bgColorInput.value
      s.textColor = textColorInput.value
      s.highlightColor = highlightColorInput.value
      s.promptColor = promptColorInput.value
      s.emphasisColor = emphasisColorInput.value
      s.baseFontSize =
        parseFloat(baseFontSizeInput.value) ||
        DEFAULT_SETTINGS.baseFontSize
      s.titleFontSize =
        parseFloat(titleFontSizeInput.value) ||
        DEFAULT_SETTINGS.titleFontSize
      s.containerWidth =
        parseFloat(containerWidthInput.value) ||
        DEFAULT_SETTINGS.containerWidth
      s.logSectionRadius = 
        parseFloat(logSectionRadiusInput.value) || 
        DEFAULT_SETTINGS.logSectionRadius;
      s.lineHeight =
        parseFloat(lineHeightInput.value) ||
        DEFAULT_SETTINGS.lineHeight
      s.letterSpacing =
        parseFloat(letterSpacingInput.value) ||
        DEFAULT_SETTINGS.letterSpacing
      s.italicizeNarration = italicizeNarrationCheckbox.checked
      s.simpleOutputMode = simpleOutputCheckbox.checked
      s.disableChatLogCollapse = disableChatLogCollapseCheckbox.checked
      s.isAutoInputMode = inputModeToggle.checked
      s.dialogueUseBubble = dialogueBubbleToggle.checked
      s.narrationUseLine = narrationLineToggle.checked
      s.showBriefHeaderInfo = showBriefHeaderInfoToggle.checked
    } catch (e) {
      console.error("설정 읽기 오류:", e)
      return { ...DEFAULT_SETTINGS }
    }
    return s
  }
  function applySettings(settings, markAsModified = false) {
    try {
      characterNameInput.value = settings.characterName ?? ""
      modelNameInput.value = settings.modelName ?? ""
      promptNameInput.value = settings.promptName ?? ""
      assistModelNameInput.value = settings.assistModelName ?? ""
      userNameInput.value = settings.userName ?? ""
      chatNumberInput.value = settings.chatNumber ?? ""
      characterImageUrlInput.value = settings.characterImageUrl ?? ""
      noCharacterImageToggle.checked = !(settings.useCharacterImage ?? true)
      updateImageUrlInputState(settings.useCharacterImage ?? true)
      bgColorInput.value = settings.backgroundColor
      bgColorText.value = settings.backgroundColor
      textColorInput.value = settings.textColor
      textColorText.value = settings.textColor
      highlightColorInput.value = settings.highlightColor
      highlightColorText.value = settings.highlightColor
      promptColorInput.value = settings.promptColor
      promptColorText.value = settings.promptColor
      emphasisColorInput.value = settings.emphasisColor
      emphasisColorText.value = settings.emphasisColor
      baseFontSizeInput.value = settings.baseFontSize
      titleFontSizeInput.value = settings.titleFontSize
      containerWidthInput.value = settings.containerWidth
      logSectionRadiusInput.value = settings.logSectionRadius ?? DEFAULT_SETTINGS.logSectionRadius
      lineHeightInput.value = settings.lineHeight ?? DEFAULT_SETTINGS.lineHeight
      letterSpacingInput.value = settings.letterSpacing ?? DEFAULT_SETTINGS.letterSpacing
      italicizeNarrationCheckbox.checked = !!settings.italicizeNarration
      simpleOutputCheckbox.checked = !!settings.simpleOutputMode
      disableChatLogCollapseCheckbox.checked =
        !!settings.disableChatLogCollapse
      inputModeToggle.checked = !!settings.isAutoInputMode
      dialogueBubbleToggle.checked = !!settings.dialogueUseBubble
      narrationLineToggle.checked = !!settings.narrationUseLine
      showBriefHeaderInfoToggle.checked = !!settings.showBriefHeaderInfo
      updateInputModeGuide(settings.isAutoInputMode)
      if (markAsModified) {
        localStorage.setItem(USER_MODIFIED_COLOR_FLAG, "true")
      }
      updateGuideColors()
    } catch (e) {
      console.error("설정 적용 오류:", e)
    }
  }
  function setTheme(isDarkMode) {
    const c = isDarkMode ? "dark" : "light"
    const p = isDarkMode ? "light" : "dark"
    body.classList.replace(`${p}-mode`, `${c}-mode`)
    themeToggleText.textContent = isDarkMode ? "다크 모드" : "라이트 모드"
    try {
      const bg = bgColorInput.value.toLowerCase()
      const tx = textColorInput.value.toLowerCase()
      const rs = getComputedStyle(document.documentElement)
      const pdb = rs
        .getPropertyValue(
          p === "dark" ? "--log-bg-dark" : "--log-bg-light",
        )
        ?.trim()
        .toLowerCase()
      const pdt = rs
        .getPropertyValue(
          p === "dark" ? "--log-text-dark" : "--log-text-light",
        )
        ?.trim()
        .toLowerCase()
      const umc =
        localStorage.getItem(USER_MODIFIED_COLOR_FLAG) === "true"
      if (pdb && pdt) {
        if (!umc || (bg === pdb && tx === pdt)) {
          const nbg = rs
            .getPropertyValue(
              c === "dark" ? "--log-bg-dark" : "--log-bg-light",
            )
            ?.trim()
          const ntx = rs
            .getPropertyValue(
              c === "dark" ? "--log-text-dark" : "--log-text-light",
            )
            ?.trim()
          if (nbg && ntx) {
            bgColorInput.value = nbg
            bgColorText.value = nbg
            textColorInput.value = ntx
            textColorText.value = ntx
            localStorage.removeItem(USER_MODIFIED_COLOR_FLAG)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
    updateGuideColors()
    generatePreview()
  }
  function toggleTheme() {
    const i = themeToggleCheckbox.checked
    localStorage.setItem("theme_v25", i ? "dark" : "light")
    setTheme(i)
  }
  function applySavedTheme() {
    const s =
      localStorage.getItem("theme_v25") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    const i = s === "dark"
    themeToggleCheckbox.checked = i
    setTheme(i)
  }
  function updateGuideColors() {
    const h = highlightColorInput.value
    const e = emphasisColorInput.value
    if (guideHighlightExample) {
      guideHighlightExample.style.backgroundColor = h
    }
    if (guideEmphasisExample) {
      guideEmphasisExample.style.backgroundColor = e
    }
  }
  function syncColorInputs() {
    const i = [
      { p: bgColorInput, t: bgColorText, y: "logColor" },
      { p: textColorInput, t: textColorText, y: "logColor" },
      { p: highlightColorInput, t: highlightColorText, y: "themeColor" },
      { p: promptColorInput, t: promptColorText, y: "themeColor" },
      { p: emphasisColorInput, t: emphasisColorText, y: "themeColor" },
    ]
    i.forEach(({ p, t, y }) => {
      const h = () => {
        if (y === "logColor" || y === "themeColor") {
          localStorage.setItem(USER_MODIFIED_COLOR_FLAG, "true")
        }
        updateGuideColors()
        generatePreview()
      }
      p.addEventListener("input", () => {
        t.value = p.value
        h()
      })
      t.addEventListener("input", () => {
        if (/^#([0-9a-fA-F]{3}){1,2}$/.test(t.value)) {
          try {
            p.value = t.value
            h()
          } catch (e) {}
        }
      })
    })
    ;[baseFontSizeInput, titleFontSizeInput, containerWidthInput].forEach(
      (n) => {
        n?.addEventListener("input", generatePreview)
      },
    )
  }
  function setupAutoSave(textarea) {
    if (!textarea || !textarea.id) return
    const k = `${AUTOSAVE_PREFIX}${textarea.id}`
    try {
      const s = localStorage.getItem(k)
      if (s !== null) {
        textarea.value = s
      }
    } catch (e) {
      console.error(e)
    }
    textarea.addEventListener("input", () => {
      try {
        localStorage.setItem(k, textarea.value)
      } catch (e) {
        console.error(e)
      }
    })
  }
  function addChatSection(content = "") {
    const u = `chatInput_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const n = document.createElement("div")
    n.classList.add("section", "chat-section")
    n.innerHTML = `<div class="section-header"><label>채팅 입력</label><div class="section-controls"><button type="button" class="move-btn move-up" title="위로 이동">▲</button><button type="button" class="move-btn move-down" title="아래로 이동">▼</button><button type="button" class="danger-button remove-section-btn" title="채팅 입력 섹션 삭제">X</button></div></div><div class="markdown-toolbar"><button type="button" class="format-btn" data-narration="true" title="나레이션 (Ctrl+Alt+1)">나레이션<kbd>Ctrl+Alt+1</kbd></button><button type="button" class="format-btn" data-speaker="AI" title="AI 대사 (Ctrl+Alt+2)">AI<kbd>Ctrl+Alt+2</kbd></button><button type="button" class="format-btn" data-speaker="USER" title="USER 대사 (Ctrl+Alt+3)">USER<kbd>Ctrl+Alt+3</kbd></button><span class="toolbar-divider"></span><button type="button" class="markdown-btn" data-type="bold" title="굵게 (Ctrl+B)"><b>B</b><kbd>Ctrl+B</kbd></button><button type="button" class="markdown-btn" data-type="italic" title="기울임 (Ctrl+I)"><i>I</i><kbd>Ctrl+I</kbd></button><button type="button" class="markdown-btn" data-type="boldItalic" title="굵은 기울임"><b><i>BI</i></b></button><button type="button" class="markdown-btn" data-type="highlight" title="하이라이트 적용 (^텍스트^) (Ctrl+H)">하이라이트<kbd>Ctrl+H</kbd></button><button type="button" class="markdown-btn" data-type="emphasis" title="강조 적용 ($텍스트$) (Ctrl+E)">강조<kbd>Ctrl+E</kbd></button></div><textarea id="${u}" class="full-width chat-input-area" placeholder="여기에 추가 채팅 내용을 입력하세요..." title="채팅 내용 입력 (자동 저장됨)">${content}</textarea>`
    chatSectionsContainer.appendChild(n)
    const t = n.querySelector("textarea")
    setupAutoSave(t)
    updateMoveButtons()
    addToolbarListeners(n)
    return n
  }
  function removeChatSection(sectionElement) {
    const i = sectionElement.querySelector("textarea")?.id
    if (i) {
      const k = `${AUTOSAVE_PREFIX}${i}`
      try {
        localStorage.removeItem(k)
      } catch (e) {
        console.error(e)
      }
    }
    sectionElement.remove()
    updateMoveButtons()
  }
  function updateMoveButtons() {
    const s = chatSectionsContainer.querySelectorAll(".chat-section")
    s.forEach((e, i) => {
      const u = e.querySelector(".move-up")
      const d = e.querySelector(".move-down")
      const r = e.querySelector(".remove-section-btn")
      if (u) u.disabled = i === 0
      if (d) d.disabled = i === s.length - 1
      if (r) r.disabled = s.length === 1
    })
  }
  function moveSection(sectionElement, direction) {
    if (direction === "up" && sectionElement.previousElementSibling) {
      chatSectionsContainer.insertBefore(
        sectionElement,
        sectionElement.previousElementSibling,
      )
    } else if (
      direction === "down" &&
      sectionElement.nextElementSibling
    ) {
      chatSectionsContainer.insertBefore(
        sectionElement,
        sectionElement.nextElementSibling.nextSibling,
      )
    }
    updateMoveButtons()
  }
  function addToolbarListeners(parentElement) {
    parentElement.querySelectorAll(".markdown-btn").forEach((b) => {
      b.addEventListener("click", function () {
        const t = this.dataset.type
        const a = this.closest(".chat-section").querySelector("textarea")
        applyMarkdown(a, t)
      })
    })
    parentElement.querySelectorAll(".format-btn").forEach((b) => {
      b.addEventListener("click", function () {
        const a = this.closest(".chat-section").querySelector("textarea")
        if (this.dataset.speaker) {
          applyPrefix(a, this.dataset.speaker + ": ")
        } else if (this.dataset.narration) {
          applyPrefix(a, "- ")
        }
      })
    })
  }
  function generatePreview() {
    try {
      const t = chatSectionsContainer.querySelectorAll(".chat-input-area")
      const c = Array.from(t).map((e) => e.value)
      const s = getCurrentSettings()
      const h = formatChatToHTML(c, s)
      htmlOutput.value = h
      previewArea.innerHTML = h
    } catch (e) {
      console.error("미리보기 오류:", e)
      previewArea.innerHTML = `<p style='color: red;'>미리보기 오류. 콘솔(F12) 확인.</p><pre>${e.stack || e}</pre>`
      htmlOutput.value = ``
    }
  }
  function resetAll() {
    if (
      !confirm(
        "모든 입력 내용과 설정을 초기화하시겠습니까? (프리셋 제외)",
      )
    )
      return
    updateDefaultSettingsFromCSS()
    const i = body.classList.contains("dark-mode")
    const b = { ...DEFAULT_SETTINGS }
    b.backgroundColor = getComputedStyle(document.documentElement)
      .getPropertyValue(i ? "--log-bg-dark" : "--log-bg-light")
      .trim()
    b.textColor = getComputedStyle(document.documentElement)
      .getPropertyValue(i ? "--log-text-dark" : "--log-text-light")
      .trim()
    b.highlightColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--highlight-color")
      .trim()
    b.promptColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--secondary-color")
      .trim()
    b.emphasisColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--emphasis-color")
      .trim()
    b.italicizeNarration = DEFAULT_SETTINGS.italicizeNarration
    b.simpleOutputMode = DEFAULT_SETTINGS.simpleOutputMode
    b.disableChatLogCollapse = DEFAULT_SETTINGS.disableChatLogCollapse
    b.isAutoInputMode = DEFAULT_SETTINGS.isAutoInputMode
    applySettings(b)
    localStorage.removeItem(USER_MODIFIED_COLOR_FLAG)
    const s = chatSectionsContainer.querySelectorAll(".chat-section")
    s.forEach((e, x) => {
      const t = e.querySelector("textarea")
      if (t && t.id) {
        const k = `${AUTOSAVE_PREFIX}${t.id}`
        localStorage.removeItem(k)
      }
      if (x === 0 && t) {
        t.value = ""
      } else if (x > 0) {
        e.remove()
      }
    })
    updateMoveButtons()
    htmlOutput.value = ""
    previewArea.innerHTML = "미리보기 영역입니다."
    alert("초기화 완료.")
    generatePreview()
  }
  function loadPresets() {
    presetListSelect.innerHTML =
      '<option value="">-- 프리셋 선택 --</option>'
    try {
      const p = JSON.parse(
        localStorage.getItem(PRESET_STORAGE_KEY) || "{}",
      )
      Object.keys(p)
        .sort()
        .forEach((n) => {
          const o = document.createElement("option")
          o.value = n
          o.textContent = n
          presetListSelect.appendChild(o)
        })
    } catch (e) {
      console.error(e)
    }
  }
  function savePreset() {
    const n = presetNameInput.value.trim()
    if (!n) {
      alert("프리셋 이름 입력")
      presetNameInput.focus()
      return
    }
    try {
      const p = JSON.parse(
        localStorage.getItem(PRESET_STORAGE_KEY) || "{}",
      )
      p[n] = getCurrentSettings()
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(p))
      loadPresets()
      presetListSelect.value = n
      presetNameInput.value = ""
      alert(`프리셋 '${n}' 저장 완료.`)
      localStorage.setItem(USER_MODIFIED_COLOR_FLAG, "true")
    } catch (e) {
      console.error(e)
      alert("프리셋 저장 실패")
    }
  }
  function loadPreset() {
    const n = presetListSelect.value
    if (!n) {
      alert("프리셋 선택")
      return
    }
    try {
      const p = JSON.parse(
        localStorage.getItem(PRESET_STORAGE_KEY) || "{}",
      )
      if (p[n]) {
        applySettings(p[n], true)
        generatePreview()
        alert(`프리셋 '${n}' 로드 완료.`)
      } else {
        alert("프리셋 없음")
        loadPresets()
      }
    } catch (e) {
      console.error(e)
      alert("프리셋 로드 실패")
    }
  }
  function deletePreset() {
    const n = presetListSelect.value
    if (!n) {
      alert("삭제할 프리셋 선택")
      return
    }
    if (!confirm(`프리셋 '${n}' 삭제?`)) {
      return
    }
    try {
      const p = JSON.parse(
        localStorage.getItem(PRESET_STORAGE_KEY) || "{}",
      )
      if (p[n]) {
        delete p[n]
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(p))
        loadPresets()
        alert(`프리셋 '${n}' 삭제 완료.`)
      } else {
        alert("프리셋 없음")
        loadPresets()
      }
    } catch (e) {
      console.error(e)
      alert("프리셋 삭제 실패")
    }
  }
  function tryCopyExecCommand(textToCopy, button, updateButtonState) {
    const t = htmlOutput
    const o = t.readOnly
    let s = false
    try {
      t.readOnly = false
      t.select()
      t.setSelectionRange(0, textToCopy.length)
      s = document.execCommand("copy")
    } catch (e) {
      console.error(e)
      s = false
    } finally {
      t.readOnly = o
      window.getSelection()?.removeAllRanges()
    }
    updateButtonState(s)
    if (!s) {
      alert("자동 복사 실패.\n직접 복사하세요.")
    }
  }
  function updateInputModeGuide(isAutoMode) {
    if (guideInputModeSpan && guidePrefixSpan && guideAutoSpan) {
      guideInputModeSpan.textContent = isAutoMode
        ? "사칭방지용"
        : "풀사칭용"
      guidePrefixSpan.style.display = isAutoMode ? "none" : "block"
      guideAutoSpan.style.display = isAutoMode ? "block" : "none"
    }
  }
  function updateImageUrlInputState(useImage) {
    if (characterImageUrlInput) {
      characterImageUrlInput.disabled = !useImage
      characterImageUrlInput.style.opacity = useImage ? '1' : '0.5'
    if (characterImageUrlLabel) {
      characterImageUrlLabel.style.opacity = useImage ? '1' : '0.5';
    }
    if (!useImage) {
      characterImageUrlInput.value = "";
    }
    }
  }

  // --- 이벤트 리스너 설정 ---
  function safelyAttachListener(element, eventType, handler) {
    if (element) {
      element.addEventListener(eventType, handler)
    } else {
      console.warn(`Listener skipped: ${handler?.name || "anon"}`)
    }
  }
  safelyAttachListener(themeToggleCheckbox, "change", toggleTheme)
  safelyAttachListener(resetAllButton, "click", resetAll)
  document.querySelectorAll(".theme-btn").forEach((b) => {
    safelyAttachListener(b, "click", function () {
      const t = this.getAttribute("data-theme")
      const m = colorThemes[t]
      if (!m) return
      highlightColorInput.value = m.h
      highlightColorText.value = m.h
      promptColorInput.value = m.p
      promptColorText.value = m.p
      emphasisColorInput.value = m.e
      emphasisColorText.value = m.e
      localStorage.setItem(USER_MODIFIED_COLOR_FLAG, "true")
      updateGuideColors()
      generatePreview()
    })
  })
  if (chatSectionsContainer) {
    chatSectionsContainer
      .querySelectorAll(".chat-input-area")
      .forEach(setupAutoSave)
    chatSectionsContainer.addEventListener("click", function (e) {
      const t = e.target
      const s = t.closest(".chat-section")
      if (!s) return
      if (t.classList.contains("remove-section-btn") && !t.disabled) {
        if (confirm("섹션 삭제?")) {
          removeChatSection(s)
        }
      } else if (t.classList.contains("move-up") && !t.disabled) {
        moveSection(s, "up")
      } else if (t.classList.contains("move-down") && !t.disabled) {
        moveSection(s, "down")
      }
    })
    addToolbarListeners(chatSectionsContainer)
  }
  safelyAttachListener(addChatSectionBtn, "click", () => addChatSection())
  safelyAttachListener(savePresetBtn, "click", savePreset)
  safelyAttachListener(loadPresetBtn, "click", loadPreset)
  safelyAttachListener(deletePresetBtn, "click", deletePreset)
  safelyAttachListener(generateButton, "click", generatePreview)
  safelyAttachListener(loadExampleBtn, "click", function () {
    const f = chatSectionsContainer?.querySelector(".chat-input-area")
    if (f) {
      const pEx = `- 화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.\nUSER: 안녕하세요? 오늘 ^날씨^가 어때요?\n- AI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.\nAI: 안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***`
      const aEx = `화창한 봄날, 공원에서 우연히 만난 두 사람은 *짧게* 대화를 나누기 시작했다.\n"안녕하세요? 오늘 ^날씨^가 어때요?"\nAI는 잠시 생각에 잠기더니 환하게 웃으며 대답했다.\n"안녕하세요! 오늘 날씨는 맑고 화창합니다. 최고 기온은 $23도$로 예상됩니다. ***야외 활동하기 좋은 날씨네요!***"`
      const a = getCurrentSettings().isAutoInputMode
      const t = a ? aEx : pEx
      const m = a ? "(사칭방지용 예제)" : "(풀사칭용 예제)"
      if (f.value && !confirm(`내용 있음. 예제 덮어쓰기?\n${m}`)) {
        return
      }
      f.value = t
      f.dispatchEvent(new Event("input", { bubbles: true }))
      generatePreview()
      alert(`예제 로드 완료. ${m}`)
    } else {
      alert("채팅 입력 영역 없음")
    }
  })
  safelyAttachListener(noCharacterImageToggle, 'change', () => {
    const useImage = !noCharacterImageToggle.checked
    updateImageUrlInputState(useImage)
    generatePreview()
  })
  safelyAttachListener(copyButton, "click", function () {
    if (!htmlOutput.value) {
      alert("HTML 생성 먼저.")
      return
    }
    const x = htmlOutput.value
    const b = this
    const o = b.textContent
    function u(s) {
      b.textContent = s ? "복사 완료!" : "복사 실패"
      b.style.backgroundColor = s ? "#28a745" : "#dc3545"
      setTimeout(() => {
        b.textContent = o
        b.style.backgroundColor = ""
      }, 2000)
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(x)
        .then(() => {
          u(true)
        })
        .catch((e) => {
          console.warn(e)
          tryCopyExecCommand(x, b, u)
        })
    } else {
      console.warn("Clipboard API 불가")
      tryCopyExecCommand(x, b, u)
    }
  })
  const inputsToTrackForPreview = [
    characterNameInput,
    modelNameInput,
    promptNameInput,
    assistModelNameInput,
    userNameInput,
    chatNumberInput,
    characterImageUrlInput,
    bgColorInput,
    textColorInput,
    highlightColorInput,
    promptColorInput,
    emphasisColorInput,
    baseFontSizeInput,
    titleFontSizeInput,
    containerWidthInput,
    logSectionRadiusInput,
    lineHeightInput,
    letterSpacingInput,  
    bgColorText,
    textColorText,
    highlightColorText,
    promptColorText,
    emphasisColorText,
  ]
  inputsToTrackForPreview.forEach((input) => {
    safelyAttachListener(input, "input", () => {
      try {
        if (
          input === bgColorText &&
          /^#([0-9a-fA-F]{3}){1,2}$/.test(input.value)
        )
          bgColorInput.value = input.value
        else if (
          input === textColorText &&
          /^#([0-9a-fA-F]{3}){1,2}$/.test(input.value)
        )
          textColorInput.value = input.value
        else if (
          input === highlightColorText &&
          /^#([0-9a-fA-F]{3}){1,2}$/.test(input.value)
        )
          highlightColorInput.value = input.value
        else if (
          input === promptColorText &&
          /^#([0-9a-fA-F]{3}){1,2}$/.test(input.value)
        )
          promptColorInput.value = input.value
        else if (
          input === emphasisColorText &&
          /^#([0-9a-fA-F]{3}){1,2}$/.test(input.value)
        )
          emphasisColorInput.value = input.value
      } catch (e) {
        console.error(e)
      }
      generatePreview()
    })
    if (input && input.type === "number") {
      safelyAttachListener(input, "change", generatePreview)
    }
  })
  safelyAttachListener(
    italicizeNarrationCheckbox,
    "change",
    generatePreview,
  )
  safelyAttachListener(simpleOutputCheckbox, "change", generatePreview)
  safelyAttachListener(
    disableChatLogCollapseCheckbox,
    "change",
    generatePreview,
  )
  safelyAttachListener(inputModeToggle, "change", () => {
    updateInputModeGuide(inputModeToggle.checked)
    generatePreview()
  })
  safelyAttachListener(dialogueBubbleToggle, "change", generatePreview)
  safelyAttachListener(narrationLineToggle, "change", generatePreview)
  safelyAttachListener(showBriefHeaderInfoToggle, "change", generatePreview)
  // 입력 모드 변경 시 가이드 업데이트 및 미리보기
  document.addEventListener("keydown", function (event) {
    const a = document.activeElement
    if (a.tagName !== "TEXTAREA" && a.tagName !== "INPUT") {
      return
    }
    let h = false
    const t = a.closest(".chat-section")?.querySelector("textarea")
    if (!t) return
    if (event.ctrlKey && !event.shiftKey && event.altKey) {
      switch (event.key) {
        case "1":
          applyPrefix(t, "- ")
          h = true
          break
        case "2":
          applyPrefix(t, "AI: ")
          h = true
          break
        case "3":
          applyPrefix(t, "USER: ")
          h = true
          break
      }
    } else if (event.ctrlKey && !event.shiftKey && !event.altKey) {
      switch (event.key.toUpperCase()) {
        case "B":
          applyMarkdown(t, "bold")
          h = true
          break
        case "I":
          applyMarkdown(t, "italic")
          h = true
          break
        case "H":
          applyMarkdown(t, "highlight")
          h = true
          break
        case "E":
          applyMarkdown(t, "emphasis")
          h = true
          break
      }
    }
    if (h) {
      event.preventDefault()
    }
  })

  // --- 초기화 실행 ---
  try {
    updateDefaultSettingsFromCSS()
    applySettings(DEFAULT_SETTINGS)
    applySavedTheme()
    loadPresets()
    updateGuideColors()
    updateMoveButtons()
    generatePreview()
    console.log("챗챈 로그 제조기 초기화 완료 (V.1.4).")
  } catch (initError) {
    console.error("초기화 오류:", initError)
    alert("페이지 초기화 오류. 콘솔(F12) 확인.")
  }
})
