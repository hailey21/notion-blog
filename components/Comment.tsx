import type * as React from 'react';
import Giscus from '@giscus/react';

import type * as types from '@/lib/types';
import * as config from '@/lib/config';
import { useDarkMode } from '@/lib/use-dark-mode';

import styles from './styles.module.css'

export function Comment() {
  const { isDarkMode } = useDarkMode()
  const info: types.GiscusInfo = config.giscus

  return (info &&
    <div className={styles.giscusContainer}>
      <Giscus repo={info.repo}
			repoId={info.repoId}
			category={info.category}
			categoryId={info.categoryId}
			mapping={info.mapping}
			reactionsEnabled={info.reactionsEnabled || "1"}
			emitMetadata={info.emitMetadata || "0"}
			inputPosition={info.inputPosition || "top"}
			theme={isDarkMode ? info.darkTheme || info.theme : info.theme}
			lang={info.lang || "ko"}
			loading={info.loading || "lazy"}
	/>
    </div>
  )
}
