import React, { useCallback } from 'react'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'

import './ProposalModal.css'
import './FollowUpModal.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
export type FollowUpModalProps = Omit<ModalProps, 'children'> & {
  onDismiss: (e: React.MouseEvent<any>) => void,
  forumUrl: string | null
}

export function FollowUpModal({ open, onDismiss, forumUrl, ...props }: FollowUpModalProps) {
  const l = useFormatMessage()
  const linkToProposal = window.location.href.split('&newProposal')[0]
  const [copied, state] = useClipboardCopy(Time.Second)
  const handleCopy = useCallback(() => {
    state.copy(linkToProposal)
  }, [state.copy])

  return <Modal {...props} open={open} size="tiny" className={TokenList.join(['ProposalModal', 'FollowUpModal'])}
                closeIcon={<Close />}>
    <Modal.Content className="ProposalModal__Title">
      <Header>{l('modal.follow_up.title')}</Header>
      <Paragraph small className="FollowUpModal__Description">
        {l('modal.follow_up.description')}
      </Paragraph>
      <Paragraph small>{l('modal.follow_up.sub')}</Paragraph>
    </Modal.Content>
    <Modal.Content className="FollowUpModal__Form">
      <div className={TokenList.join(['FollowUpModal__Banner', 'JoinTheDiscussion'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.follow_up.view_on_forum_title')}</Paragraph>
          <Paragraph tiny>{l('modal.follow_up.view_on_forum_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'JoinTheDiscussion'])}
                primary size="small"
                href={forumUrl}
                target="_blank">
          {l('modal.follow_up.view_on_forum_label')}
        </Button>
      </div>
      <div className={TokenList.join(['FollowUpModal__Banner', 'Discord'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.follow_up.join_discord_title')}</Paragraph>
          <Paragraph tiny>{l('modal.follow_up.join_discord_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'Discord'])}
                primary size="small"
                href={'https://dcl.gg/discord'}
                target="_blank">
          {l('modal.follow_up.join_discord_label')}
        </Button>
      </div>
      <div className={TokenList.join(['FollowUpModal__Banner', 'CopyLink'])}>
        <div className="Description">
          <Paragraph small semiBold>{l('modal.follow_up.copy_link_title')}</Paragraph>
          <Paragraph tiny>{l('modal.follow_up.copy_link_description')}</Paragraph>
        </div>
        <Button className={TokenList.join(['Button', 'CopyLink'])}
                onClick={handleCopy}
                primary size="small">
          {copied ? l('modal.follow_up.link_copied_label') : l('modal.follow_up.copy_link_label')}
        </Button>
      </div>
    </Modal.Content>
    <Modal.Content className="ProposalModal__Actions">
      <Button className="FollowUpModal__DismissButton" secondary
              onClick={onDismiss}>{l('modal.follow_up.dismiss_button_label')}</Button>
    </Modal.Content>
  </Modal>
}
