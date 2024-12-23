import type * as types from 'notion-types'
import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
import cs from 'classnames'
import * as React from 'react'
import { Breadcrumbs, Header, Search, useNotionContext } from 'react-notion-x'

import { isSearchEnabled, navigationLinks, navigationStyle } from '@/lib/config'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

function ScrollProgress() {
  const [progress, setProgress] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const main = document.querySelector('main')
    const giscus = document.querySelector('.giscus')
    if (!main) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(main)

    const handleScroll = () => {
      if (!isVisible || !main) return

      const mainRect = main.getBoundingClientRect()
      const mainTop = mainRect.top
      const mainHeight = mainRect.height - (giscus?.clientHeight || 0)
      const windowHeight = window.innerHeight

      let progress = 0
      if (mainTop <= 0) {
        const remainingScroll = mainHeight + mainTop - windowHeight
        const totalScroll = mainHeight - windowHeight
        progress = ((totalScroll - remainingScroll) / totalScroll) * 100
        progress = Math.min(Math.max(progress, 0), 100)
      }
      
      setProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isVisible])

  return (
    <div className={cs(styles.progressContainer)}>
      <div 
        className={cs(styles.progressBar)}
        style={{ width: `${progress}%` }} 
      />
    </div>
  )
}

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const onToggleTheme = React.useCallback(() => {
    toggleDarkMode()
  }, [toggleDarkMode])

  return (
    <div
      className={cs('breadcrumb', 'button', !hasMounted && styles.hidden)}
      onClick={onToggleTheme}
    >
      {hasMounted && isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
    </div>
  )
}

export function NotionPageHeader({
  block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {
  const { components, mapPageUrl } = useNotionContext()

  if (navigationStyle === 'default') {
    return (
      <>
        <Header block={block} />
        <ScrollProgress />
      </>
    )
  }

  return (
    <header className='notion-header'>
      <div className='notion-nav-header'>
        <Breadcrumbs block={block} rootOnly={true} />

        <div className='notion-nav-header-rhs breadcrumbs'>
          {navigationLinks
            ?.map((link, index) => {
              if (!link.pageId && !link.url) {
                return null
              }

              if (link.pageId) {
                return (
                  <components.PageLink
                    href={mapPageUrl(link.pageId)}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                  >
                    {link.title}
                  </components.PageLink>
                )
              } else {
                return (
                  <components.Link
                    href={link.url}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                  >
                    {link.title}
                  </components.Link>
                )
              }
            })
            .filter(Boolean)}

          <ToggleThemeButton />

          {isSearchEnabled && <Search block={block} title={null} />}
        </div>
      </div>
      <ScrollProgress />
    </header>
  )
}
