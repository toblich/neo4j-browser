/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { isBuffer } from 'lodash'
import React, { useRef, useState, useEffect } from 'react'
import { Frame } from 'shared/modules/stream/streamDuck'
import FrameTitlebar from './FrameTitlebar'

import {
  StyledFrame,
  StyledFrameBody,
  StyledFrameContents,
  StyledFrameStatusbar,
  StyledFrameMainSection,
  StyledFrameAside
} from './styled'

type FrameTemplateProps = {
  contents: JSX.Element | null | string
  header?: Frame
  className?: string
  onResize?: (fullscreen: boolean, collapsed: boolean, height: number) => void
  numRecords?: number
  getRecords?: () => any
  visElement?: any
  runQuery?: () => any
  sidebar?: () => JSX.Element | null
  aside?: JSX.Element | null
  statusbar?: JSX.Element | null
  alwaysCollapsed?: boolean
  alwaysFullscreen?: boolean
  hasContent?: boolean
}

function FrameTemplate({
  header,
  contents,
  onResize = () => {
    /*noop*/
  },
  className,
  numRecords = 0,
  getRecords,
  visElement,
  runQuery,
  sidebar,
  aside,
  statusbar,
  alwaysCollapsed,
  alwaysFullscreen,
  hasContent
}: FrameTemplateProps): JSX.Element {
  const [lastHeight, setLastHeight] = useState(10)
  const frameContentElementRef = useRef<any>(null)
  const [hasNodes, setHasNodes] = useState(false)
  const [hadContent, setHasContent] = useState(false)

  let {
    isFullscreen,
    isCollapsed,
    isPinned,
    toggleFullScreen,
    toggleCollapse,
    togglePin
  } = useSizeToggles()

  useEffect(() => {
    if (hasContent && !hadContent) {
      toggleFullScreen()
      setHasContent(true)
    }
  }, [hasContent, hadContent, toggleFullScreen, setHasContent])

  const willBeFullscreen = isFullscreen || alwaysFullscreen || false
  isCollapsed = isCollapsed || alwaysCollapsed || false

  useEffect(() => {
    if (!frameContentElementRef.current?.clientHeight) return
    const currHeight = frameContentElementRef.current.clientHeight
    if (currHeight < 300) return // No need to report a transition

    if (lastHeight !== currHeight) {
      onResize(isFullscreen, isCollapsed, currHeight)
      setLastHeight(currHeight)
    }
  }, [lastHeight, isPinned, isFullscreen, isCollapsed, onResize])

  const classNames = []
  if (className) {
    classNames.push(className)
  }
  if (willBeFullscreen) {
    classNames.push('is-fullscreen')
  }

  return (
    <StyledFrame
      className={classNames.join(' ')}
      data-testid="frame"
      fullscreen={willBeFullscreen}
    >
      {header && (
        <FrameTitlebar
          frame={header}
          fullscreen={willBeFullscreen}
          fullscreenToggle={toggleFullScreen}
          collapse={isCollapsed}
          collapseToggle={toggleCollapse}
          pinned={isPinned}
          togglePin={togglePin}
          numRecords={numRecords}
          getRecords={getRecords}
          visElement={visElement}
          runQuery={runQuery}
        />
      )}

      <StyledFrameBody fullscreen={willBeFullscreen} collapsed={isCollapsed}>
        {sidebar && sidebar()}
        {aside && <StyledFrameAside>{aside}</StyledFrameAside>}
        <StyledFrameMainSection>
          <StyledFrameContents
            fullscreen={willBeFullscreen}
            ref={frameContentElementRef}
            data-testid="frameContents"
          >
            {contents}
          </StyledFrameContents>
        </StyledFrameMainSection>
      </StyledFrameBody>

      {statusbar && (
        <StyledFrameStatusbar
          fullscreen={willBeFullscreen}
          data-testid="frameStatusbar"
        >
          {statusbar}
        </StyledFrameStatusbar>
      )}
    </StyledFrame>
  )
}

function useSizeToggles() {
  const [isFullscreen, setFullscreen] = useState(false)
  const [isCollapsed, setCollapsed] = useState(false)
  const [isPinned, setPinned] = useState(false)

  function toggleFullScreen() {
    setFullscreen(full => !full)
  }
  function toggleCollapse() {
    setCollapsed(coll => !coll)
  }
  function togglePin() {
    setPinned(pin => !pin)
  }
  return {
    isFullscreen,
    isCollapsed,
    isPinned,
    toggleFullScreen,
    toggleCollapse,
    togglePin
  }
}

export default FrameTemplate
