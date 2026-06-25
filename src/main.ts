import "./style.css"
import { parseCidrList, toBatRoutes, toAmneziaJson } from "./converter"
import {
  detectLocale,
  formatBytes,
  formatLineCount,
  getLocaleStrings,
  type Locale,
} from "./i18n/index"

const locale = detectLocale()
const strings = getLocaleStrings(locale)

const app = getElement<HTMLElement>("app")
const pageTitle = getElement<HTMLElement>("page-title")
const brand = getElement<HTMLElement>("app-brand")
const fileInput = getElement<HTMLInputElement>("file-input")
const clearButton = getElement<HTMLButtonElement>("clear-button")
const downloadBatButton = getElement<HTMLButtonElement>("download-bat")
const downloadJsonButton = getElement<HTMLButtonElement>("download-json")
const validCount = getElement<HTMLElement>("valid-count")
const invalidCount = getElement<HTMLElement>("invalid-count")
const validLabel = getElement<HTMLElement>("valid-label")
const invalidLabel = getElement<HTMLElement>("invalid-label")
const statusText = getElement<HTMLElement>("status-text")
const invalidList = getElement<HTMLUListElement>("invalid-list")
const fileSummary = getElement<HTMLElement>("file-summary")
const filePickerLabel = getElement<HTMLElement>("file-picker-label")
const inputLabel = getElement<HTMLElement>("input-label")
const uploadHint = getElement<HTMLElement>("upload-hint")
const fileSummaryLabel = getElement<HTMLElement>("file-summary-label")
const fileName = getElement<HTMLElement>("file-name")
const fileSize = getElement<HTMLElement>("file-size")
const emptyState = getElement<HTMLElement>("empty-state")
const emptyStateTitle = getElement<HTMLElement>("empty-state-title")
const emptyStateText = getElement<HTMLElement>("empty-state-text")
const outputPane = getElement<HTMLElement>("output-pane")
const reportHeading = getElement<HTMLElement>("report-heading")

const MAX_VISIBLE_INVALID_LINES = 25
const BAT_FILENAME_PREFIX = "keenetic"
const BAT_FILENAME_EXTENSION = "bat"
const JSON_FILENAME_PREFIX = "amnezia"
const JSON_FILENAME_EXTENSION = "json"

let loadedFileText: string | null = null
let hasFileReadError = false

applyLocale(locale)

fileInput.addEventListener("change", () => {
  void handleFileInputChange()
})

async function handleFileInputChange(): Promise<void> {
  const file = fileInput.files?.[0]

  if (!file) {
    return
  }

  try {
    loadedFileText = await file.text()
  } catch {
    fileInput.value = ""
    loadedFileText = null
    hasFileReadError = true
    fileSummary.hidden = true
    fileName.textContent = ""
    fileSize.textContent = ""
    emptyState.hidden = false
    updateReport()
    return
  }

  hasFileReadError = false
  fileName.textContent = file.name
  fileSize.textContent = formatBytes(locale, file.size)
  fileSummary.hidden = false
  emptyState.hidden = true
  updateReport()
}

clearButton.addEventListener("click", () => {
  fileInput.value = ""
  loadedFileText = null
  hasFileReadError = false
  fileSummary.hidden = true
  fileName.textContent = ""
  fileSize.textContent = ""
  emptyState.hidden = false
  updateReport()
  fileInput.focus()
})

downloadBatButton.addEventListener("click", () => {
  const { valid } = parseCidrList(getInputText())
  downloadFile(
    createTimestampedFilename(BAT_FILENAME_PREFIX, BAT_FILENAME_EXTENSION),
    toBatRoutes(valid),
    "application/x-bat",
  )
})

downloadJsonButton.addEventListener("click", () => {
  const { valid } = parseCidrList(getInputText())
  downloadFile(
    createTimestampedFilename(JSON_FILENAME_PREFIX, JSON_FILENAME_EXTENSION),
    toAmneziaJson(valid),
    "application/json",
  )
})

updateReport()

function updateReport(): void {
  const inputText = getInputText()
  const { valid, invalid } = parseCidrList(inputText)
  const hasInput = inputText.trim().length > 0
  const canDownload = valid.length > 0

  validCount.textContent = String(valid.length)
  invalidCount.textContent = String(invalid.length)
  downloadBatButton.disabled = !canDownload
  downloadJsonButton.disabled = !canDownload
  invalidList.replaceChildren(...createInvalidLineItems(invalid))

  if (hasFileReadError) {
    statusText.textContent = strings.fileReadError
  } else if (!hasInput) {
    statusText.textContent = strings.emptyStatus
  } else if (invalid.length === 0) {
    statusText.textContent = formatMessage(strings.readyStatus, {
      validLineCount: formatLineCount(locale, valid.length),
    })
  } else {
    statusText.textContent = formatMessage(strings.partialStatus, {
      validLineCount: formatLineCount(locale, valid.length),
      invalidLineCount: formatLineCount(locale, invalid.length),
    })
  }
}

function getInputText(): string {
  return loadedFileText ?? ""
}

function createInvalidLineItems(invalid: string[]): HTMLLIElement[] {
  const visibleLines = invalid
    .slice(0, MAX_VISIBLE_INVALID_LINES)
    .map(createInvalidLineItem)
  const hiddenCount = invalid.length - visibleLines.length

  if (hiddenCount > 0) {
    visibleLines.push(
      createInvalidLineItem(
        formatMessage(strings.moreInvalidLines, {
          lineCount: formatLineCount(locale, hiddenCount),
        }),
      ),
    )
  }

  return visibleLines
}

function applyLocale(locale: Locale): void {
  document.documentElement.lang = locale
  document.title = strings.documentTitle
  app.setAttribute("aria-label", strings.workspaceAriaLabel)
  brand.textContent = strings.brand
  pageTitle.textContent = strings.pageTitle
  validLabel.textContent = strings.statsValid
  invalidLabel.textContent = strings.statsInvalid
  filePickerLabel.textContent = strings.filePicker
  clearButton.textContent = strings.clearButton
  inputLabel.textContent = strings.inputLabel
  uploadHint.textContent = strings.uploadHint
  emptyStateTitle.textContent = strings.emptyStateTitle
  emptyStateText.textContent = strings.emptyStateText
  fileSummaryLabel.textContent = strings.fileSummaryLabel
  downloadBatButton.textContent = strings.downloadBat
  downloadJsonButton.textContent = strings.downloadJson
  outputPane.setAttribute("aria-label", strings.resultsAriaLabel)
  reportHeading.textContent = strings.reportHeading
  invalidList.setAttribute("aria-label", strings.invalidListAriaLabel)
}

function createInvalidLineItem(value: string): HTMLLIElement {
  const item = document.createElement("li")
  item.textContent = value
  return item
}

function formatMessage(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{(\w+)}/g, (placeholder, key: string) => {
    return values[key] ?? placeholder
  })
}

function downloadFile(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  link.style.display = "none"
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function createTimestampedFilename(
  filenamePrefix: string,
  filenameExtension: string,
  date = new Date(),
): string {
  const year = date.getFullYear()
  const month = formatDatePart(date.getMonth() + 1)
  const day = formatDatePart(date.getDate())
  const hours = formatDatePart(date.getHours())
  const minutes = formatDatePart(date.getMinutes())

  return `${filenamePrefix}_${year}-${month}-${day}_${hours}:${minutes}.${filenameExtension}`
}

function formatDatePart(value: number): string {
  return String(value).padStart(2, "0")
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)

  if (!element) {
    throw new Error(`Element #${id} was not found.`)
  }

  return element as T
}
