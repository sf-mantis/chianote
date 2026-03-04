export type ToothType = 'PRIMARY' | 'PERMANENT';

export interface ToothData {
    id: string; // FDI Notation (e.g., '11', '51')
    type: ToothType;
    x: number; // For manual positioning in the 2D chart
    y: number; // For manual positioning in the 2D chart
    name: string; // Human readable name (e.g., '상악 우측 제2유구치')
}

// Helper to deduce name based on FDI ID
export const getToothName = (id: string, type: ToothType): string => {
    const quadrant = parseInt(id.charAt(0));
    const position = parseInt(id.charAt(1));

    let arch = '';
    let side = '';
    let specificName = '';

    // Arch
    if ([1, 2, 5, 6].includes(quadrant)) arch = '상악';
    else arch = '하악';

    // Side
    if ([1, 4, 5, 8].includes(quadrant)) side = '우측';
    else side = '좌측';

    if (type === 'PRIMARY') {
        switch (position) {
            case 1: specificName = '유중절치 (앞니1)'; break;
            case 2: specificName = '유측절치 (앞니2)'; break;
            case 3: specificName = '유견치 (송곳니)'; break;
            case 4: specificName = '제1유구치 (어금니1)'; break;
            case 5: specificName = '제2유구치 (어금니2)'; break;
        }
    } else {
        switch (position) {
            case 1: specificName = '중절치 (앞니1)'; break;
            case 2: specificName = '측절치 (앞니2)'; break;
            case 3: specificName = '견치 (송곳니)'; break;
            case 4: specificName = '제1소구치 (작은어금니1)'; break;
            case 5: specificName = '제2소구치 (작은어금니2)'; break;
            case 6: specificName = '제1대구치 (큰어금니1)'; break;
            case 7: specificName = '제2대구치 (큰어금니2)'; break;
            case 8: specificName = '제3대구치 (사랑니)'; break;
        }
    }

    return `${arch} ${side} ${specificName}`;
};

// FDI Notation for Primary Teeth (Baby teeth, 20 teeth)
// Quadrants: 5 (Upper Right), 6 (Upper Left), 7 (Lower Left), 8 (Lower Right)
export const PRIMARY_TEETH: ToothData[] = [
    // Upper Right (51-55)
    { id: '55', type: 'PRIMARY', x: 20, y: 30, name: getToothName('55', 'PRIMARY') },
    { id: '54', type: 'PRIMARY', x: 28, y: 22, name: getToothName('54', 'PRIMARY') },
    { id: '53', type: 'PRIMARY', x: 38, y: 15, name: getToothName('53', 'PRIMARY') },
    { id: '52', type: 'PRIMARY', x: 44, y: 10, name: getToothName('52', 'PRIMARY') },
    { id: '51', type: 'PRIMARY', x: 48, y: 8, name: getToothName('51', 'PRIMARY') },

    // Upper Left (61-65)
    { id: '61', type: 'PRIMARY', x: 52, y: 8, name: getToothName('61', 'PRIMARY') },
    { id: '62', type: 'PRIMARY', x: 56, y: 10, name: getToothName('62', 'PRIMARY') },
    { id: '63', type: 'PRIMARY', x: 62, y: 15, name: getToothName('63', 'PRIMARY') },
    { id: '64', type: 'PRIMARY', x: 72, y: 22, name: getToothName('64', 'PRIMARY') },
    { id: '65', type: 'PRIMARY', x: 80, y: 30, name: getToothName('65', 'PRIMARY') },

    // Lower Left (71-75)
    ...(Array.from([
        { id: '71', type: 'PRIMARY' as ToothType, x: 52, y: 92, name: getToothName('71', 'PRIMARY') },
        { id: '72', type: 'PRIMARY' as ToothType, x: 56, y: 90, name: getToothName('72', 'PRIMARY') },
        { id: '73', type: 'PRIMARY' as ToothType, x: 62, y: 85, name: getToothName('73', 'PRIMARY') },
        { id: '74', type: 'PRIMARY' as ToothType, x: 72, y: 78, name: getToothName('74', 'PRIMARY') },
        { id: '75', type: 'PRIMARY' as ToothType, x: 80, y: 70, name: getToothName('75', 'PRIMARY') },
    ]).reverse()),

    // Lower Right (81-85)
    ...[
        { id: '85', type: 'PRIMARY' as ToothType, x: 20, y: 70, name: getToothName('85', 'PRIMARY') },
        { id: '84', type: 'PRIMARY' as ToothType, x: 28, y: 78, name: getToothName('84', 'PRIMARY') },
        { id: '83', type: 'PRIMARY' as ToothType, x: 38, y: 85, name: getToothName('83', 'PRIMARY') },
        { id: '82', type: 'PRIMARY' as ToothType, x: 44, y: 90, name: getToothName('82', 'PRIMARY') },
        { id: '81', type: 'PRIMARY' as ToothType, x: 48, y: 92, name: getToothName('81', 'PRIMARY') },
    ]
];

// FDI Notation for Permanent Teeth (Adult teeth, 32 teeth)
// Quadrants: 1 (UR), 2 (UL), 3 (LL), 4 (LR)
export const PERMANENT_TEETH: ToothData[] = [
    // Upper Right (11-18)
    { id: '18', type: 'PERMANENT', x: 10, y: 40, name: getToothName('18', 'PERMANENT') },
    { id: '17', type: 'PERMANENT', x: 15, y: 32, name: getToothName('17', 'PERMANENT') },
    { id: '16', type: 'PERMANENT', x: 20, y: 24, name: getToothName('16', 'PERMANENT') },
    { id: '15', type: 'PERMANENT', x: 28, y: 18, name: getToothName('15', 'PERMANENT') },
    { id: '14', type: 'PERMANENT', x: 35, y: 12, name: getToothName('14', 'PERMANENT') },
    { id: '13', type: 'PERMANENT', x: 42, y: 8, name: getToothName('13', 'PERMANENT') },
    { id: '12', type: 'PERMANENT', x: 46, y: 5, name: getToothName('12', 'PERMANENT') },
    { id: '11', type: 'PERMANENT', x: 48, y: 4, name: getToothName('11', 'PERMANENT') },

    // Upper Left (21-28)
    { id: '21', type: 'PERMANENT', x: 52, y: 4, name: getToothName('21', 'PERMANENT') },
    { id: '22', type: 'PERMANENT', x: 54, y: 5, name: getToothName('22', 'PERMANENT') },
    { id: '23', type: 'PERMANENT', x: 58, y: 8, name: getToothName('23', 'PERMANENT') },
    { id: '24', type: 'PERMANENT', x: 65, y: 12, name: getToothName('24', 'PERMANENT') },
    { id: '25', type: 'PERMANENT', x: 72, y: 18, name: getToothName('25', 'PERMANENT') },
    { id: '26', type: 'PERMANENT', x: 80, y: 24, name: getToothName('26', 'PERMANENT') },
    { id: '27', type: 'PERMANENT', x: 85, y: 32, name: getToothName('27', 'PERMANENT') },
    { id: '28', type: 'PERMANENT', x: 90, y: 40, name: getToothName('28', 'PERMANENT') },

    // Lower Left (31-38)
    ...(Array.from([
        { id: '31', type: 'PERMANENT' as ToothType, x: 52, y: 96, name: getToothName('31', 'PERMANENT') },
        { id: '32', type: 'PERMANENT' as ToothType, x: 54, y: 95, name: getToothName('32', 'PERMANENT') },
        { id: '33', type: 'PERMANENT' as ToothType, x: 58, y: 92, name: getToothName('33', 'PERMANENT') },
        { id: '34', type: 'PERMANENT' as ToothType, x: 65, y: 88, name: getToothName('34', 'PERMANENT') },
        { id: '35', type: 'PERMANENT' as ToothType, x: 72, y: 82, name: getToothName('35', 'PERMANENT') },
        { id: '36', type: 'PERMANENT' as ToothType, x: 80, y: 76, name: getToothName('36', 'PERMANENT') },
        { id: '37', type: 'PERMANENT' as ToothType, x: 85, y: 68, name: getToothName('37', 'PERMANENT') },
        { id: '38', type: 'PERMANENT' as ToothType, x: 90, y: 60, name: getToothName('38', 'PERMANENT') },
    ]).reverse()),

    // Lower Right (41-48)
    ...[
        { id: '48', type: 'PERMANENT' as ToothType, x: 10, y: 60, name: getToothName('48', 'PERMANENT') },
        { id: '47', type: 'PERMANENT' as ToothType, x: 15, y: 68, name: getToothName('47', 'PERMANENT') },
        { id: '46', type: 'PERMANENT' as ToothType, x: 20, y: 76, name: getToothName('46', 'PERMANENT') },
        { id: '45', type: 'PERMANENT' as ToothType, x: 28, y: 82, name: getToothName('45', 'PERMANENT') },
        { id: '44', type: 'PERMANENT' as ToothType, x: 35, y: 88, name: getToothName('44', 'PERMANENT') },
        { id: '43', type: 'PERMANENT' as ToothType, x: 42, y: 92, name: getToothName('43', 'PERMANENT') },
        { id: '42', type: 'PERMANENT' as ToothType, x: 46, y: 95, name: getToothName('42', 'PERMANENT') },
        { id: '41', type: 'PERMANENT' as ToothType, x: 48, y: 96, name: getToothName('41', 'PERMANENT') },
    ]
];

export const TOOTH_STATUS = [
    { value: 'HEALTHY', label: '정상', color: 'bg-green-100 hover:bg-green-200 border-green-400' },
    { value: 'DECAYED', label: '충치', color: 'bg-red-100 hover:bg-red-200 border-red-500' },
    { value: 'TREATED', label: '신경치료/레진', color: 'bg-primary-100 hover:bg-primary-200 border-primary-500' },
    { value: 'SEALANT', label: '실란트', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-400' },
    { value: 'EXTRACTED', label: '발치', color: 'bg-gray-100 hover:bg-gray-200 border-gray-400 opacity-50' },
];
