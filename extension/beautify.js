function recursiveSearch(el) {
  childEls = el.querySelectorAll(':scope > *')
  childEls.forEach((childEl) => {
    if (childEl.querySelector('table')) {
      childEl.style.display = 'flex'
      childEl.style.alignItems = 'center'
      childEl.style.flexDirection = 'column'
      childEl.style.width = '100%'
      el.style.paddingRight = '0'
      el.style.paddingLeft = '0'
      recursiveSearch(childEl)
    } else if (childEl.tagName !== 'table') {
      childEl.style.maxWidth = '416px'
    } else { // table
      childEl.style.maxWidth = '640px'
    }
  })
}

function beautify(content) {
  // Inject styles to the iframe
  const style = iframe.contentDocument.createElement('style')
  style.textContent = `
[enabled-fact='true'],
[inline-fact='true'],
[inline-block-fact='true'],
[selected-fact='false'],
[selected-fact='true'] {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

[enabled-fact='true']:hover {
  background-color: transparent !important;
}
[enabled-fact="true"][inline-fact="true"][selected-fact="false"], #settings-modal .enabled-example {
  border: none !important;
}
[enabled-fact="true"][inline-block-fact="true"][selected-fact="false"] {
  outline: none !important;
}
[enabled-fact="true"][text-block-fact="true"][selected-fact="false"] {
  box-shadow: none !important;
}
[highlight-fact="true"], #settings-modal .highlighted-example {
  background-color: transparent !important;
}
[highlight-fact="true"] > * {
  background-color: transparent !important;
}
#dynamic-xbrl-form [selected-fact="true"], #settings-modal .selected-fact-example {
  outline: none !important;
}
[enabled-fact="true"]:hover, #settings-modal span.tag-shading-example {
  background-color: transparent !important;
}
[hover-fact="true"] {
  background-color: transparent !important;
}
  `
  iframe.contentDocument.head.appendChild(style)

  // Remove Table of Contents links at the top of every page
  const tocs = content.querySelectorAll('a')
  tocs.forEach((toc) => {
    if (toc.innerText === 'Table of Contents') {
      toc.remove()
    }
  })

  // Remove page numbers and spacing between pages
  let pageNumbers = content.querySelectorAll('*')
  pageNumbers = pageNumbers.forEach((pageNumber) => {
    if ((pageNumber.style.height === '42.75pt' || pageNumber.style.height === '36pt') && pageNumber.style.position === 'relative' && pageNumber.style.width === '100%') {
      pageNumber.remove()
    } else if ((pageNumber.style.minHeight === '42.75pt' || pageNumber.style.minHeight === '36pt') && pageNumber.style.width === '100%') {
      pageNumber.remove()
    }
  })

  // Remove hr's
  const hrs = content.querySelectorAll('hr')
  hrs.forEach((hr) => hr.remove())

  // Restrict page with to 416px, except for tables and images. Tables are restricted to 640px and images are unrestricted.
  const els = content.querySelectorAll(':scope > *')
  els.forEach((el) => {
    if (el.querySelector('table, img') === null) { // search all child descendants
      el.style.maxWidth = '416px'
      el.style.boxSizing = 'border-box'
      el.style.marginLeft = 'auto'
      el.style.marginRight = 'auto'
    } else {
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.flexDirection = 'column'
      el.style.paddingRight = '0'
      el.style.paddingLeft = '0'
      let table = el.querySelector('table') // will select table no matter where it is in descendent
      if (table !== null) {
        el.style.width = '100%'
        recursiveSearch(el)
      }
    }
  })
}

const iframe = document.querySelector('#ixvFrame')

function observeIframeBody() {
  const body = iframe.contentDocument?.body
  if (!body) return false;

  const observer = new MutationObserver(() => {
    const content = body.querySelector('#xbrl-section-current')
    if (content) {
      observer.disconnect()
      beautify(content)
    }
  })

  observer.observe(body, {
    subtree: true,
    childList: true,
  })

  return observer
}

if (iframe) {
  iframe.addEventListener('load', () => {
    const observer = observeIframeBody()
    if (!observer) {
      iframe.contentDocument.addEventListener('DOMContentLoaded', () => observeIframeBody(), {
        once: true,
      })
    }
  })
}
