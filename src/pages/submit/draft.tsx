import React, { useEffect, useMemo, useState } from 'react'
import Helmet from 'react-helmet'
import { navigate } from 'gatsby-plugin-intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'
import { newProposalDraftScheme} from '../../entities/Proposal/types'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { Governance } from '../../api/Governance'
import loader from '../../modules/loader'
import locations from '../../modules/locations'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import { useLocation } from '@reach/router'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import LogIn from '../../components/User/LogIn'
import './submit.css'

const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || ''

type DraftState = {
  linked_proposal_id: string | null,
  title: string,
  summary: string,
  abstract: string,
  motivation: string,
  specification: string,
  conclusion: string,
}
const initialState: DraftState = {
  linked_proposal_id: null,
  title: '',
  summary: '',
  abstract: '',
  motivation: '',
  specification: '',
  conclusion: ''
}
const schema = newProposalDraftScheme.properties
const edit = (state: DraftState, props: Partial<DraftState>) => {
  return {
    ...state,
    ...props
  }
}
const validate = createValidator<DraftState>({
  title: (state) => ({
    title: assert(state.title.length <= schema.title.maxLength, 'error.draft.title_too_large') ||
      undefined
  }),
  summary: (state) => ({
    summary: assert(state.summary.length <= schema.summary.maxLength, 'error.draft.summary_too_large') ||
      undefined
  }),
  abstract: (state) => ({
    abstract: assert(state.abstract.length <= schema.abstract.maxLength, 'error.draft.abstract_too_large') ||
      undefined
  }),
  motivation: (state) => ({
    motivation: assert(state.motivation.length <= schema.motivation.maxLength, 'error.draft.motivation_too_large') ||
      undefined
  }),
  specification: (state) => ({
    specification: assert(state.specification.length <= schema.specification.maxLength, 'error.draft.specification_too_large') ||
      undefined
  }),
  conclusion: (state) => ({
    conclusion: assert(state.conclusion.length <= schema.conclusion.maxLength, 'error.draft.conclusion_too_large') ||
      undefined
  }),
  '*': (state) => ({
    linked_proposal_id: (
      assert(!!state.linked_proposal_id, 'error.draft.linked_proposal_empty')
    ),
    title: (
      assert(state.title.length > 0, 'error.draft.title_empty') ||
      assert(state.title.length >= schema.title.minLength, 'error.draft.title_too_short') ||
      assert(state.title.length <= schema.title.maxLength, 'error.draft.title_too_large')
    ),
    summary: (
      assert(state.summary.length > 0, 'error.draft.summary_empty') ||
      assert(state.summary.length >= schema.summary.minLength, 'error.draft.summary_too_short') ||
      assert(state.summary.length <= schema.summary.maxLength, 'error.draft.summary_too_large')
    ),
    abstract: (
      assert(state.abstract.length > 0, 'error.draft.abstract_empty') ||
      assert(state.abstract.length >= schema.abstract.minLength, 'error.draft.abstract_too_short') ||
      assert(state.abstract.length <= schema.abstract.maxLength, 'error.draft.abstract_too_large')
    ),
    motivation: (
      assert(state.motivation.length > 0, 'error.draft.motivation_empty') ||
      assert(state.motivation.length >= schema.motivation.minLength, 'error.draft.motivation_too_short') ||
      assert(state.motivation.length <= schema.motivation.maxLength, 'error.draft.motivation_too_large')
    ),
    specification: (
      assert(state.specification.length > 0, 'error.draft.specification_empty') ||
      assert(state.specification.length >= schema.specification.minLength, 'error.draft.specification_too_short') ||
      assert(state.specification.length <= schema.specification.maxLength, 'error.draft.specification_too_large')
    ),
    conclusion: (
      assert(state.conclusion.length > 0, 'error.draft.conclusion_empty') ||
      assert(state.conclusion.length >= schema.conclusion.minLength, 'error.draft.conclusion_too_short') ||
      assert(state.conclusion.length <= schema.conclusion.maxLength, 'error.draft.conclusion_too_large')
    )
  })
})

export default function SubmitDraftProposal() {
  const l = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const preselectedLinkedProposalId = params.get('linked_proposal_id')
  const [account, accountState] = useAuthContext()
  const accountBalance = isEthereumAddress(params.get('address') || '') ? params.get('address') : account
  const [votingPower, votingPowerState] = useVotingPowerBalance(accountBalance, SNAPSHOT_SPACE)
  const submissionVpNotMet = useMemo(() => votingPower < Number(process.env.GATSBY_SUBMISSION_THRESHOLD_DRAFT), [votingPower])
  const [preselectedProposal] = useAsyncMemo(async () => {
    if(!preselectedLinkedProposalId) return undefined
    const proposal = await Governance.get().getProposal(preselectedLinkedProposalId)
    if(!proposal) return undefined
    return [{
      key: proposal.id,
      text: proposal.title,
      value: proposal.id
    }]
  }, [] , { initialValue: undefined })
  const [state, editor] = useEditor(edit, validate, initialState)
  const [formDisabled, setFormDisabled] = useState(false);

  useEffect(() => {
    if (!!preselectedLinkedProposalId) {
      editor.set({ linked_proposal_id: preselectedLinkedProposalId })
    }
  }, [preselectedLinkedProposalId])

  useEffect(() => {
    if (state.validated) {
      setFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          return Governance.get().createProposalDraft({
            ...state.value,
            linked_proposal_id: state.value.linked_proposal_id!
          })
        })
        .then((proposal) => {
          loader.proposals.set(proposal.id, proposal)
          navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ '*': err.body?.error || err.message })
          setFormDisabled(false)
        })
    }
  }, [state.validated])

  if (accountState.loading) {
    return <Container className="WelcomePage">
      <div>
        <Loader size="huge" active />
      </div>
    </Container>
  }

  if (!account) {
    return <LogIn
      title={l('page.submit_draft.title') || ''}
      description={l('page.submit_draft.description') || ''}
    />
  }

  return <ContentLayout small>
    <Head
      title={l('page.submit_draft.title') || ''}
      description={l('page.submit_draft.description') || ''}
      image="https://decentraland.org/images/decentraland.png"
    />
    <Helmet title={l('page.submit_draft.title') || ''} />

    <ContentSection>
      <Header size="huge">{l('page.submit_draft.title')}</Header>
    </ContentSection>
    <ContentSection className="MarkdownSection--tiny">
      {l.markdown('page.submit_draft.description')}
    </ContentSection>

    <ContentSection>
      <Label>{l('page.submit_draft.linked_proposal_label')}</Label>
      <SelectField
        value={state.value.linked_proposal_id || undefined}
        placeholder={l('page.submit_draft.linked_proposal_placeholder') || undefined}
        onChange={(_, { value }) => editor.set({ linked_proposal_id: String(value) })}
        options={preselectedProposal}
        error={!!state.error.linked_proposal_id}
        message={l.optional(state.error.linked_proposal_id)}
        disabled={true}
        loading={votingPowerState.loading}
      />
    </ContentSection>

    <ContentSection>
      <Label>{l('page.submit_draft.title_label')}</Label>
      <Field
        value={state.value.title}
        placeholder={l('page.submit_draft.title_placeholder')}
        onChange={(_, { value }) => editor.set({ title: value })}
        onBlur={() => editor.set({ title: state.value.title.trim() })}
        error={!!state.error.title}
        message={
          l.optional(state.error.title) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.title.length,
            limit: schema.title.maxLength
          })
        }
        disabled={submissionVpNotMet || formDisabled}
        loading={votingPowerState.loading}
      />
    </ContentSection>

    <ContentSection>
      <Label>
        {l('page.submit_draft.summary_label')}
        <MarkdownNotice />
      </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_draft.summary_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.summary}
        placeholder={l('page.submit_draft.summary_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ summary: value })}
        onBlur={() => editor.set({ summary: state.value.summary.trim() })}
        error={!!state.error.summary}
        message={
          l.optional(state.error.summary) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.summary.length,
            limit: schema.summary.maxLength
          })
        }
        disabled={submissionVpNotMet || formDisabled}
      />
    </ContentSection>

    <ContentSection>
      <Label>
        {l('page.submit_draft.abstract_label')}
        <MarkdownNotice />
      </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_draft.abstract_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.abstract}
        placeholder={l('page.submit_draft.abstract_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ abstract: value })}
        onBlur={() => editor.set({ abstract: state.value.abstract.trim() })}
        error={!!state.error.abstract}
        message={
          l.optional(state.error.abstract) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.abstract.length,
            limit: schema.abstract.maxLength
          })
        }
        disabled={submissionVpNotMet || formDisabled}
      />
    </ContentSection>

    <ContentSection>
      <Label>
        {l('page.submit_draft.motivation_label')}
        <MarkdownNotice />
      </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_draft.motivation_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.motivation}
        placeholder={l('page.submit_draft.motivation_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ motivation: value })}
        onBlur={() => editor.set({ motivation: state.value.motivation.trim() })}
        error={!!state.error.motivation}
        message={
          l.optional(state.error.motivation) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.motivation.length,
            limit: schema.motivation.maxLength
          })
        }
        disabled={submissionVpNotMet || formDisabled}
      />
    </ContentSection>

    <ContentSection>
      <Label>
        {l('page.submit_draft.specification_label')}
        <MarkdownNotice />
      </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_draft.specification_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.specification}
        placeholder={l('page.submit_draft.specification_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ specification: value })}
        onBlur={() => editor.set({ specification: state.value.specification.trim() })}
        error={!!state.error.specification}
        message={
          l.optional(state.error.specification) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.specification.length,
            limit: schema.specification.maxLength
          })
        }
        disabled={submissionVpNotMet || formDisabled}
      />
    </ContentSection>

    <ContentSection>
      <Label>
        {l('page.submit_draft.conclusion_label')}
        <MarkdownNotice />
      </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_draft.conclusion_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.conclusion}
        placeholder={l('page.submit_draft.conclusion_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ conclusion: value })}
        onBlur={() => editor.set({ conclusion: state.value.conclusion.trim() })}
        error={!!state.error.conclusion}
        message={
          l.optional(state.error.conclusion) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.conclusion.length,
            limit: schema.specification.maxLength
          })
        }
        disabled={submissionVpNotMet || formDisabled}
      />
    </ContentSection>


    <ContentSection>
      <Button primary
              disabled={state.validated || submissionVpNotMet}
              loading={state.validated || votingPowerState.loading}
              onClick={() => editor.validate()}>
        {l('page.submit.button_submit')}
      </Button>
    </ContentSection>
    {state.error['*'] && <ContentSection>
      <Paragraph small primary>{l(state.error['*']) || state.error['*']}</Paragraph>
    </ContentSection>}
    {submissionVpNotMet && <ContentSection>
      <Paragraph small primary>{l('error.draft.submission_vp_not_met')}</Paragraph>
    </ContentSection>}
  </ContentLayout>
}
