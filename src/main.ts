import "./style.css"
import { parseCidrList, toBatRoutes, toAmneziaJson } from "./converter"

const fileInput = getElement<HTMLInputElement>("file-input")
const textInput = getElement<HTMLTextAreaElement>("cidr-input")
const clearButton = getElement<HTMLButtonElement>("clear-button")
const downloadBatButton = getElement<HTMLButtonElement>("download-bat")
const downloadJsonButton = getElement<HTMLButtonElement>("download-json")
const validCount = getElement<HTMLElement>("valid-count")
const invalidCount = getElement<HTMLElement>("invalid-count")
const statusText = getElement<HTMLElement>("status-text")
const invalidList = getElement<HTMLUListElement>("invalid-list")
const fileSummary = getElement<HTMLElement>("file-summary")
const fileName = getElement<HTMLElement>("file-name")
const fileSize = getElement<HTMLElement>("file-size")

const MAX_VISIBLE_INVALID_LINES = 25

let loadedFileText: string | null = null

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0]

  if (!file) {
    return
  }

  loadedFileText = await file.text()
  textInput.value = ""
  fileName.textContent = file.name
  fileSize.textContent = formatBytes(file.size)
  fileSummary.hidden = false
  textInput.hidden = true
  updateReport()
})

textInput.addEventListener("input", () => {
  loadedFileText = null
  updateReport()
})

clearButton.addEventListener("click", () => {
  fileInput.value = ""
  loadedFileText = null
  textInput.value = ""
  fileSummary.hidden = true
  fileName.textContent = ""
  fileSize.textContent = ""
  textInput.hidden = false
  updateReport()
  textInput.focus()
})

downloadBatButton.addEventListener("click", () => {
  const { valid } = parseCidrList(getInputText())
  downloadFile("routes.bat", toBatRoutes(valid), "application/x-bat")
})

downloadJsonButton.addEventListener("click", () => {
  const { valid } = parseCidrList(getInputText())
  downloadFile("amnezia.json", toAmneziaJson(valid), "application/json")
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

  if (!hasInput) {
    statusText.textContent = "Добавьте список CIDR для конвертации."
  } else if (invalid.length === 0) {
    statusText.textContent = `Готово к скачиванию: ${formatCount(valid.length, "строка", "строки", "строк")}.`
  } else {
    statusText.textContent = `Будет сконвертировано ${formatCount(
      valid.length,
      "строка",
      "строки",
      "строк",
    )}, пропущено ${formatCount(invalid.length, "строка", "строки", "строк")}.`
  }
}

function getInputText(): string {
  return loadedFileText ?? textInput.value
}

function createInvalidLineItems(invalid: string[]): HTMLLIElement[] {
  const visibleLines = invalid
    .slice(0, MAX_VISIBLE_INVALID_LINES)
    .map(createInvalidLineItem)
  const hiddenCount = invalid.length - visibleLines.length

  if (hiddenCount > 0) {
    visibleLines.push(
      createInvalidLineItem(
        `И еще ${formatCount(hiddenCount, "строка", "строки", "строк")}.`,
      ),
    )
  }

  return visibleLines
}

function createInvalidLineItem(value: string): HTMLLIElement {
  const item = document.createElement("li")
  item.textContent = value
  return item
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

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)

  if (!element) {
    throw new Error(`Element #${id} was not found.`)
  }

  return element as T
}

function formatBytes(bytes: number): string {
  const units = ["Б", "КБ", "МБ", "ГБ"]
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const precision = unitIndex === 0 || value >= 10 ? 0 : 1
  return `${value.toFixed(precision)} ${units[unitIndex]}`
}

function formatCount(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = count % 10
  const mod100 = count % 100
  const word =
    mod10 === 1 && mod100 !== 11
      ? one
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? few
        : many

  return `${count} ${word}`
}
