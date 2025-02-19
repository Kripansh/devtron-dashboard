import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Moment12HourFormat } from '../../../../config'
import { getChartValues } from '../../../charts/charts.service'
import { showError, DetailsProgressing } from '@devtron-labs/devtron-fe-common-lib'
import { Option } from '../../common/ReactSelect.utils'
import { getDeploymentManifestDetails } from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import {
    ChartGroupOptionType,
    ChartKind,
    ChartValuesDiffOptionType,
    ChartValuesEditorType,
    CompareWithDropdownProps,
    ValuesForDiffStateType,
} from './ChartValuesView.type'
import YAML from 'yaml'
import ReactSelect, { components } from 'react-select'
import CodeEditor from '../../../CodeEditor/CodeEditor'
import Tippy from '@tippyjs/react'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-pencil.svg'
import {
    GROUPED_OPTION_LABELS,
    ListToTraverseKeys,
    MANIFEST_OUTPUT_INFO_TEXT,
    MANIFEST_OUTPUT_TIPPY_CONTENT,
} from './ChartValuesView.constants'
import { getCompareValuesSelectStyles } from './ChartValuesView.utils'

const formatOptionLabel = (option: ChartValuesDiffOptionType): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">
                {option.label}&nbsp;{option.version && `(${option.version})`}
            </span>
            {option.info && <small className="cn-6">{option.info}</small>}
        </div>
    )
}

const customValueContainer = (props: any): JSX.Element => {
    return (
        <components.ValueContainer {...props}>
            {props.selectProps.value?.label}&nbsp;
            {props.selectProps.value?.version && `(${props.selectProps.value.version})`}
            {React.cloneElement(props.children[1], {
                style: { position: 'absolute' },
            })}
        </components.ValueContainer>
    )
}

const CompareWithDropdown = ({
    deployedChartValues,
    defaultChartValues,
    presetChartValues,
    deploymentHistoryOptionsList,
    selectedVersionForDiff,
    handleSelectedVersionForDiff,
}: CompareWithDropdownProps) => {
    const [groupedOptions, setGroupedOptions] = useState<ChartGroupOptionType[]>([
        {
            label: '',
            options: [],
        },
    ])

    useEffect(() => {
        const _groupedOptions = []
        if (deploymentHistoryOptionsList.length > 0) {
            _groupedOptions.push({
                label: GROUPED_OPTION_LABELS.PreviousDeployments,
                options: deploymentHistoryOptionsList,
            })
        }

        const noOptions = [{ label: GROUPED_OPTION_LABELS.NoOptions, value: 0, info: '' }]
        _groupedOptions.push(
            {
                label: GROUPED_OPTION_LABELS.OtherApps,
                options: deployedChartValues.length > 0 ? deployedChartValues : noOptions,
            },
            {
                label: GROUPED_OPTION_LABELS.PresetValues,
                options: presetChartValues.length > 0 ? presetChartValues : noOptions,
            },
            {
                label: GROUPED_OPTION_LABELS.DefaultValues,
                options: defaultChartValues.length > 0 ? defaultChartValues : noOptions,
            },
        )
        setGroupedOptions(_groupedOptions)
    }, [deployedChartValues, defaultChartValues, deploymentHistoryOptionsList])

    return (
        <ReactSelect
            options={groupedOptions}
            isMulti={false}
            isSearchable={false}
            value={selectedVersionForDiff}
            classNamePrefix="compare-values-select"
            isOptionDisabled={(option) => option.value === 0}
            formatOptionLabel={formatOptionLabel}
            components={{
                IndicatorSeparator: null,
                ValueContainer: customValueContainer,
                Option,
            }}
            styles={getCompareValuesSelectStyles()}
            onChange={handleSelectedVersionForDiff}
        />
    )
}

export default function ChartValuesEditor({
    loading,
    isExternalApp,
    isDeployChartView,
    isCreateValueView,
    appId,
    appName,
    valuesText,
    onChange,
    repoChartValue,
    chartValuesList,
    deploymentHistoryList,
    defaultValuesText,
    showEditorHeader,
    hasChartChanged,
    showInfoText,
    manifestView,
    generatedManifest,
    comparisonView,
    selectedChartValues,
}: ChartValuesEditorType) {
    const [valuesForDiffState, setValuesForDiffState] = useState<ValuesForDiffStateType>({
        loadingValuesForDiff: false,
        deployedChartValues: [],
        defaultChartValues: [],
        presetChartValues: [],
        deploymentHistoryOptionsList: [],
        selectedValuesForDiff: defaultValuesText,
        deployedManifest: '',
        valuesForDiff: new Map<number, string>(),
        selectedVersionForDiff: null,
    })

    useEffect(() => {
        if (
            !manifestView &&
            chartValuesList.length > 0 &&
            (isDeployChartView || isCreateValueView || deploymentHistoryList.length > 0)
        ) {
            const deployedChartValues = [],
                defaultChartValues = [],
                presetChartValues = []
            let _selectedVersionForDiff

            for (let index = 0; index < chartValuesList.length; index++) {
                const _chartValue = chartValuesList[index]
                const processedChartValue = {
                    label: _chartValue.name,
                    value: _chartValue.id,
                    appStoreVersionId: _chartValue.appStoreVersionId || 0,
                    info: _chartValue.environmentName ? `Deployed on: ${_chartValue.environmentName}` : '',
                    kind: _chartValue.kind,
                    version: _chartValue.chartVersion,
                }
                if (_chartValue.kind === ChartKind.DEPLOYED && _chartValue.name !== appName) {
                    deployedChartValues.push(processedChartValue)
                } else if (_chartValue.kind === ChartKind.DEFAULT) {
                    defaultChartValues.push(processedChartValue)
                } else if (_chartValue.kind === ChartKind.TEMPLATE) {
                    presetChartValues.push(processedChartValue)
                }
                if (isCreateValueView && _chartValue.id === selectedChartValues?.id) {
                    _selectedVersionForDiff = processedChartValue
                }
            }
            const deploymentHistoryOptionsList = deploymentHistoryList.map((_deploymentHistory) => {
                return {
                    label: moment(new Date(_deploymentHistory.deployedAt.seconds * 1000)).format(Moment12HourFormat),
                    value: _deploymentHistory.version,
                    info: '',
                    version: _deploymentHistory.chartMetadata.chartVersion,
                }
            })

            setValuesForDiffState({
                ...valuesForDiffState,
                deployedChartValues,
                defaultChartValues,
                presetChartValues,
                deploymentHistoryOptionsList,
                selectedVersionForDiff:
                    _selectedVersionForDiff ||
                    (deploymentHistoryOptionsList.length > 0
                        ? deploymentHistoryOptionsList[0]
                        : deployedChartValues.length > 0
                        ? deployedChartValues[0]
                        : presetChartValues.length > 0
                        ? presetChartValues[0]
                        : defaultChartValues[0]),
            })
        }
    }, [chartValuesList, deploymentHistoryList, selectedChartValues])

    useEffect(() => {
        if (comparisonView && valuesForDiffState.selectedVersionForDiff) {
            setValuesForDiffState({
                ...valuesForDiffState,
                loadingValuesForDiff: true,
            })
            const selectedVersionForDiff = valuesForDiffState.selectedVersionForDiff
            const _version = manifestView ? deploymentHistoryList[0].version : selectedVersionForDiff.value
            const _currentValues = manifestView
                ? valuesForDiffState.deployedManifest
                : valuesForDiffState.valuesForDiff.get(_version)
            if (!_currentValues) {
                if (
                    selectedVersionForDiff.kind === ChartKind.DEPLOYED ||
                    selectedVersionForDiff.kind === ChartKind.DEFAULT ||
                    selectedVersionForDiff.kind === ChartKind.TEMPLATE
                ) {
                    getChartValues(_version, selectedVersionForDiff.kind)
                        .then((res) => {
                            const _valuesForDiff = valuesForDiffState.valuesForDiff
                            _valuesForDiff.set(_version, res.result.values)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                loadingValuesForDiff: false,
                                valuesForDiff: _valuesForDiff,
                                selectedValuesForDiff: res.result.values,
                            })
                        })
                        .catch((e) => {
                            showError(e)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                selectedValuesForDiff: '',
                                loadingValuesForDiff: false,
                            })
                        })
                } else {
                    getDeploymentManifestDetails(appId, _version, isExternalApp)
                        .then((res) => {
                            const _valuesForDiff = valuesForDiffState.valuesForDiff
                            const _selectedValues = isExternalApp
                                ? YAML.stringify(JSON.parse(res.result.valuesYaml))
                                : res.result.valuesYaml
                            _valuesForDiff.set(_version, _selectedValues)

                            const _valuesForDiffState = {
                                ...valuesForDiffState,
                                loadingValuesForDiff: false,
                                valuesForDiff: _valuesForDiff,
                                selectedValuesForDiff: _selectedValues,
                            }

                            if (_version === deploymentHistoryList[0].version) {
                                _valuesForDiffState.deployedManifest = res.result.manifest
                            }

                            setValuesForDiffState(_valuesForDiffState)
                        })
                        .catch((e) => {
                            showError(e)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                selectedValuesForDiff: '',
                                loadingValuesForDiff: false,
                            })
                        })
                }
            } else {
                setValuesForDiffState({
                    ...valuesForDiffState,
                    loadingValuesForDiff: false,
                    selectedValuesForDiff: _currentValues,
                })
            }
        }
    }, [comparisonView, valuesForDiffState.selectedVersionForDiff])

    useEffect(() => {
        if (
            (!comparisonView && valuesForDiffState.selectedVersionForDiff) ||
            (comparisonView && !valuesForDiffState.selectedVersionForDiff)
        ) {
            let _selectedVersionForDiff
            if (isCreateValueView && selectedChartValues && valuesForDiffState.selectedVersionForDiff) {
                if (valuesForDiffState.selectedVersionForDiff.value !== selectedChartValues?.id) {
                    const listToTraverse =
                        selectedChartValues.kind === ChartKind.DEPLOYED
                            ? ListToTraverseKeys.deployedChartValues
                            : ListToTraverseKeys.defaultChartValues
                    _selectedVersionForDiff = valuesForDiffState[listToTraverse].find(
                        (chartData) => chartData.value === selectedChartValues.id,
                    )
                } else {
                    _selectedVersionForDiff = valuesForDiffState.selectedVersionForDiff
                }
            }
            setValuesForDiffState({
                ...valuesForDiffState,
                selectedVersionForDiff:
                    _selectedVersionForDiff ||
                    (valuesForDiffState.deploymentHistoryOptionsList.length > 0
                        ? valuesForDiffState.deploymentHistoryOptionsList[0]
                        : valuesForDiffState.deployedChartValues.length > 0
                        ? valuesForDiffState.deployedChartValues[0]
                        : valuesForDiffState.defaultChartValues[0]),
            })
        }
    }, [comparisonView])

    const handleSelectedVersionForDiff = (selected: ChartValuesDiffOptionType) => {
        if (selected.value !== valuesForDiffState.selectedVersionForDiff.value) {
            setValuesForDiffState({
                ...valuesForDiffState,
                selectedVersionForDiff: selected,
            })
        }
    }

    const getDynamicHeight = (): string => {
        if (isDeployChartView && (!showInfoText || showEditorHeader)) {
            return 'calc(100vh - 130px)'
        } else if (isDeployChartView || (!isDeployChartView && (!showInfoText || showEditorHeader))) {
            return 'calc(100vh - 162px)'
        } else {
            return 'calc(100vh - 196px)'
        }
    }

    return (
        <div
            className={`code-editor-container ${
                showInfoText && (hasChartChanged || manifestView) ? 'code-editor__info-enabled' : ''
            }`}
        >
            {comparisonView && (
                <div className="code-editor__header chart-values-view__diff-view-header">
                    <div className="chart-values-view__diff-view-default flex left fs-12 fw-6 cn-7">
                        {manifestView ? (
                            <span>Deployed manifest</span>
                        ) : (
                            <>
                                <span style={{ width: '90px' }}>Compare with: </span>
                                <CompareWithDropdown
                                    deployedChartValues={valuesForDiffState.deployedChartValues}
                                    defaultChartValues={valuesForDiffState.defaultChartValues}
                                    presetChartValues={valuesForDiffState.presetChartValues}
                                    deploymentHistoryOptionsList={valuesForDiffState.deploymentHistoryOptionsList}
                                    selectedVersionForDiff={valuesForDiffState.selectedVersionForDiff}
                                    handleSelectedVersionForDiff={handleSelectedVersionForDiff}
                                />
                            </>
                        )}
                    </div>
                    <div className="chart-values-view__diff-view-current flex left fs-12 fw-6 cn-7 pl-12">
                        {manifestView ? (
                            <span>Manifest output for YAML</span>
                        ) : (
                            <>
                                <Edit className="icon-dim-16 mr-10" />
                                values.yaml&nbsp;
                                {(selectedChartValues?.chartVersion || repoChartValue?.version) &&
                                    `(${selectedChartValues?.chartVersion || repoChartValue?.version})`}
                            </>
                        )}
                    </div>
                </div>
            )}
            <CodeEditor
                defaultValue={
                    comparisonView
                        ? manifestView
                            ? valuesForDiffState.deployedManifest
                            : valuesForDiffState.selectedValuesForDiff
                        : ''
                }
                value={manifestView ? generatedManifest : valuesText}
                diffView={comparisonView}
                noParsing
                mode="yaml"
                onChange={onChange}
                loading={loading || valuesForDiffState.loadingValuesForDiff}
                customLoader={
                    <DetailsProgressing size={32}>
                        {manifestView && !comparisonView && (
                            <span className="fs-13 fw-4 cn-7 mt-8 dc__align-center">
                                Generating the manifest. <br /> Please wait...
                            </span>
                        )}
                    </DetailsProgressing>
                }
                height={getDynamicHeight()}
                readOnly={manifestView}
            >
                {showEditorHeader && (
                    <CodeEditor.Header>
                        <div className="flex fs-12 fw-6 cn-7">
                            <Edit className="icon-dim-16 mr-10" />
                            values.yaml
                        </div>
                    </CodeEditor.Header>
                )}
                {!manifestView && showInfoText && hasChartChanged && (
                    <CodeEditor.Warning
                        className="dc__ellipsis-right"
                        text={`Please ensure that the values are compatible with "${repoChartValue.chartRepoName}/${repoChartValue.chartName}"`}
                    />
                )}
                {manifestView && showInfoText && (
                    <CodeEditor.Information className="dc__ellipsis-right" text={MANIFEST_OUTPUT_INFO_TEXT}>
                        <Tippy
                            className="default-tt w-250"
                            arrow={false}
                            placement="bottom"
                            content={MANIFEST_OUTPUT_TIPPY_CONTENT}
                        >
                            <span className="cursor cb-5 fw-6">&nbsp;Know more</span>
                        </Tippy>
                    </CodeEditor.Information>
                )}
            </CodeEditor>
        </div>
    )
}
