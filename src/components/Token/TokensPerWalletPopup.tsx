import React from 'react'
import { ChainId } from '@dcl/schemas'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import './TokensPerWalletPopup.css'
import { TokenInWallet } from '../../entities/Balance/types'
import { blockExplorerLink, formattedTokenBalance } from '../../entities/Wallet/utils'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'

const infoIcon = require('../../images/icons/info.svg')

export type TokensPerWalletPopupProps = React.HTMLAttributes<HTMLDivElement> & {
  tokensPerWallet: TokenInWallet[],
  open: boolean
  onCloseHandler: (e: React.MouseEvent<any>) => void
}

function networkName(network: ChainId) {
  return network == ChainId.ETHEREUM_MAINNET ? 'Ethereum' : 'Polygon'
}

export default function TokensPerWalletPopup({ tokensPerWallet, open, onCloseHandler }: TokensPerWalletPopupProps) {
  const l = useFormatMessage();

  const content =
    <Card className={'TokensPerWalletPopup__Card'}>
      <Card.Content className="TokensPerWalletPopup__Content">
        {
          tokensPerWallet.map((tokenInWallet, index) => {
            if (parseInt(tokenInWallet.tokenBalance.amount) == 0) return;

            const explorerLink = blockExplorerLink(tokenInWallet.wallet)
            return (
              <a className="TokensPerWalletPopup__Row"
                 key={[tokenInWallet.wallet.name, '_popup', index].join('::')}
                 href={explorerLink.link} target="_blank"
                 rel="noopener noreferrer">
                <div className="TokensPerWalletPopup__Block">
                  <Header>{tokenInWallet.wallet.name}</Header>
                  <Header sub>{networkName(tokenInWallet.wallet.network)} Network</Header>
                </div>
                <div className="TokensPerWalletPopup__Block TokensPerWalletPopup__RightBlock">
                  <div className={'TokensPerWalletPopup__Balance'}>
                    <Header>{l('general.number', { value: formattedTokenBalance(tokenInWallet.tokenBalance) })}</Header>
                    <Paragraph tiny>{tokenInWallet.tokenBalance.symbol}</Paragraph>
                  </div>
                  <Header sub className="TokensPerWalletPopup__Link">
                    {l('page.transparency.mission.audit', { service_name: explorerLink.name })}
                  </Header>
                </div>
              </a>)
          })
        }
      </Card.Content>
    </Card>

  return <Popup
    className="TokensPerWalletPopup"
    content={content}
    position="bottom center"
    trigger={<img src={infoIcon} width="14" height="14" alt="info" />}
    eventsEnabled={true}
    onClose={onCloseHandler}
    open={open}
    on="click"
    pinned={true}
  />
}
