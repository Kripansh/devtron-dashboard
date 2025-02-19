import { DOCUMENTATION } from '../../config'

export const getCommonSelectStyles = (styleOverrides = {}) => {
    return {
        control: (base, state) => ({
            ...base,
            minHeight: '32px',
            boxShadow: 'none',
            border: 'none',
            cursor: 'pointer',
        }),
        valueContainer: (base, state) => ({
            ...base,
            padding: '0',
            fontSize: '13px',
            fontWeight: '600',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }),
        container: (base, state) => ({
            ...base,
            width: '100%',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: 'var(--N400)',
            padding: '0 8px',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        loadingMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        ...styleOverrides,
    }
}

export const BASIC_FIELDS = {
    CONTAINER_PORT: 'container_port',
    PORT: 'port',
    INGRESS: 'ingress',
    ENABLED: 'enabled',
    HOSTS: 'hosts',
    HOST: 'host',
    PATHS: 'paths',
    PATH: 'path',
    RESOURCES: 'resources',
    RESOURCES_CPU: 'resources_cpu',
    RESOURCES_MEMORY: 'resources_memory',
    LIMITS: 'limits',
    REQUESTS: 'requests',
    CPU: 'cpu',
    MEMORY: 'memory',
    ENV_VARIABLES: 'envVariables',
    NAME: 'name',
    VALUE: 'value',
}

export const BASIC_FIELD_MAPPING = {
    [BASIC_FIELDS.PORT]: '/ContainerPort/0/port',
    [BASIC_FIELDS.ENABLED]: '/ingress/enabled',
    [BASIC_FIELDS.HOSTS]: '/ingress/hosts',
    [BASIC_FIELDS.RESOURCES]: '/resources',
    [BASIC_FIELDS.ENV_VARIABLES]: '/EnvVariables',
}

export const BASIC_FIELD_PARENT_PATH = {
    [BASIC_FIELDS.CONTAINER_PORT]: '/ContainerPort',
    [BASIC_FIELDS.INGRESS]: '/ingress',
}

export const EDITOR_VIEW = {
    UNDEFINED: 'UNDEFINED',
    BASIC: 'BASIC',
    ADVANCED: 'ADVANCED',
}

export const CHART_TYPE_TAB_KEYS = { DEVTRON_CHART: 'devtronChart', CUSTOM_CHARTS: 'customCharts' }
export const CHART_TYPE_TAB = { devtronChart: 'Charts by Devtron', customCharts: 'Custom charts' }
export const CHART_DOCUMENTATION_LINK = {
    'Job & CronJob': DOCUMENTATION.JOB_CRONJOB,
    'Rollout Deployment': DOCUMENTATION.ROLLOUT,
    Deployment: DOCUMENTATION.DEPLOYMENT,
}

export const COMPARE_VALUES_TIPPY_CONTENT = {
    compareEnvValueWithOtherValues: 'Compare with values saved for base template or other environments',
    compareBaseValueWithOtherValues: 'Compare base template values with values saved for specific environments',
    comparing: 'Comparing deployment template',
    nothingToCompare: 'Nothing to compare with',
    noCDPipelineCreated: 'No deployment pipelines are created',
}

export const README_TIPPY_CONTENT = {
    fetching: 'Fetching...',
    showing: 'Showing README.md',
    notAvailable: 'Readme is not available for this chart version',
}

export const BASIC_VIEW_TIPPY_CONTENT = {
    title: 'Basic view is locked',
    infoText:
        'Basic view is locked as some advanced configurations have been modified. Please continue editing in Advanced (YAML) view.',
}

export const DEPLOYMENT_TEMPLATE_LABELS_KEYS = {
    applicationMetrics: {
        label: 'Show application metrics',
        learnMore: 'Learn more',
        supported:
            'Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).',
        notSupported: (selectedChartName: string): string =>
            `Application metrics is not supported for ${selectedChartName} version.`,
    },
    baseTemplate: {
        key: 'base',
        label: 'Base deployment template',
        allowOverrideText:
            'Base configurations are being inherited for this environment. Allow override to fork and edit.',
    },
    codeEditor: {
        warning: 'Chart type cannot be changed once saved.',
    },
    otherEnv: {
        key: 'env',
        label: 'Values on other environments',
        noOptions: { label: 'No options', value: 0, kind: 'env' },
    },
    otherVersion: {
        key: 'chartVersion',
        label: 'Default values',
        version: 'version',
        noOptions: { label: 'No options', value: 0, kind: 'chartVersion' },
    },
}
