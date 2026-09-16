import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
    Circle,
    Line,
    Polyline,
    Text as SvgText,
} from 'react-native-svg';

type VitalPoint = {
    recordedAt: string;
    value: number | null;
};

type VitalTrendChartProps = {
    title: string;
    unit: string;
    data: VitalPoint[];
    min?: number;
    max?: number;
};

const CHART_WIDTH = 330;
const CHART_HEIGHT = 170;
const PADDING_LEFT = 42;
const PADDING_RIGHT = 12;
const PADDING_TOP = 18;
const PADDING_BOTTOM = 28;

const VitalTrendChart = ({
    title,
    unit,
    data,
    min,
    max,
}: VitalTrendChartProps) => {
    const validData = data
        .filter(
            point =>
                point.value !== null &&
                point.value !== undefined &&
                Number.isFinite(point.value),
        )
        .slice()
        .reverse();

    if (validData.length < 2) {
        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.unit}>{unit}</Text>
                </View>

                <View style={styles.empty}>
                    <Text style={styles.emptyText}>
                        Not enough historical data
                    </Text>
                </View>
            </View>
        );
    }

    const values = validData.map(point => point.value as number);

    const calculatedMin =
        min !== undefined ? min : Math.min(...values);

    const calculatedMax =
        max !== undefined ? max : Math.max(...values);

    const range =
        calculatedMax - calculatedMin === 0
            ? 1
            : calculatedMax - calculatedMin;

    const chartWidth =
        CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;

    const chartHeight =
        CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    const points = validData.map((point, index) => {
        const x =
            PADDING_LEFT +
            (index / (validData.length - 1)) * chartWidth;

        const y =
            PADDING_TOP +
            (1 -
                ((point.value as number - calculatedMin) /
                    range)) *
            chartHeight;

        return {
            x,
            y,
            value: point.value as number,
        };
    });

    const polylinePoints = points
        .map(point => `${point.x},${point.y}`)
        .join(' ');

    const latest = values[values.length - 1];

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>
                        Latest: {latest} {unit}
                    </Text>
                </View>

                <Text style={styles.unit}>{unit}</Text>
            </View>

            <Svg
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>

                <Line
                    x1={PADDING_LEFT}
                    y1={PADDING_TOP}
                    x2={PADDING_LEFT}
                    y2={CHART_HEIGHT - PADDING_BOTTOM}
                    stroke="#D9DEE7"
                    strokeWidth="1"
                />

                <Line
                    x1={PADDING_LEFT}
                    y1={CHART_HEIGHT - PADDING_BOTTOM}
                    x2={CHART_WIDTH - PADDING_RIGHT}
                    y2={CHART_HEIGHT - PADDING_BOTTOM}
                    stroke="#D9DEE7"
                    strokeWidth="1"
                />

                <Line
                    x1={PADDING_LEFT}
                    y1={PADDING_TOP}
                    x2={CHART_WIDTH - PADDING_RIGHT}
                    y2={PADDING_TOP}
                    stroke="#EEF1F5"
                    strokeWidth="1"
                />

                <Line
                    x1={PADDING_LEFT}
                    y1={PADDING_TOP + chartHeight / 2}
                    x2={CHART_WIDTH - PADDING_RIGHT}
                    y2={PADDING_TOP + chartHeight / 2}
                    stroke="#EEF1F5"
                    strokeWidth="1"
                />

                <SvgText
                    x="5"
                    y={PADDING_TOP + 4}
                    fontSize="10"
                    fill="#7A8494">
                    {Math.round(calculatedMax)}
                </SvgText>

                <SvgText
                    x="5"
                    y={PADDING_TOP + chartHeight / 2 + 4}
                    fontSize="10"
                    fill="#7A8494">
                    {Math.round(
                        (calculatedMax + calculatedMin) / 2,
                    )}
                </SvgText>

                <SvgText
                    x="5"
                    y={CHART_HEIGHT - PADDING_BOTTOM + 4}
                    fontSize="10"
                    fill="#7A8494">
                    {Math.round(calculatedMin)}
                </SvgText>

                <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {points.map((point, index) => (
                    <Circle
                        key={`${point.x}-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#2563EB"
                        strokeWidth="2"
                    />
                ))}

                <SvgText
                    x={PADDING_LEFT}
                    y={CHART_HEIGHT - 7}
                    fontSize="9"
                    fill="#7A8494">
                    {formatTime(validData[0].recordedAt)}
                </SvgText>

                <SvgText
                    x={CHART_WIDTH - PADDING_RIGHT}
                    y={CHART_HEIGHT - 7}
                    fontSize="9"
                    fill="#7A8494"
                    textAnchor="end">
                    {formatTime(
                        validData[validData.length - 1].recordedAt,
                    )}
                </SvgText>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E8EBF0',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#172033',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
    },

    unit: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },

    empty: {
        height: 170,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyText: {
        fontSize: 13,
        color: '#8A93A3',
    },
});

export default VitalTrendChart;