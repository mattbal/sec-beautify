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
  console.log('called beautify!')

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
    if (pageNumber.style.height === '42.75pt' && pageNumber.style.position === 'relative' && pageNumber.style.width === '100%') {
      pageNumber.remove()
    } else if (pageNumber.style.minHeight === '42.75pt' && pageNumber.style.width === '100%') {
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

console.log('loaded script')

const iframe = document.querySelector('#ixvFrame')

function observeIframeBody() {
  console.log('called observeIframeBody')
  const body = iframe.contentDocument?.body
  if (!body) return false;

  const observer = new MutationObserver(() => {
    console.log('mutation occurred')
    const content = body.querySelector('#xbrl-section-current')
    if (content) {
      console.log('found iframe child. Disconnecting')
      console.log('iframe child: ', { 'children': content.children })
      observer.disconnect()

      beautify(content)

      // const contentObserver = new MutationObserver(() => {
      //   console.log('content mutation occurred')
      //   contentObserver.disconnect()
      //   beautify(content)
      // })

      // contentObserver.observe(content, {
      //   subtree: true,
      //   childList: true,
      // })
      // console.log('observing content')
    }
  })

  observer.observe(body, {
    subtree: true,
    childList: true,
  })

  return observer
}

if (iframe) {
  console.log('iframe found, adding listener')
  iframe.addEventListener('load', () => {
    console.log('checking if body exists')
    const observer = observeIframeBody()
    if (!observer) {
      console.log('body does not exist, adding DOMContentLoaded listener')
      iframe.contentDocument.addEventListener('DOMContentLoaded', () => observeIframeBody(), {
        once: true,
      })
    }
  })
}
