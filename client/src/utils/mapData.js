// ─── Map / Building Directory Data ───────────────────────────────────────────

/** TAG research-group names displayed on upper-floor TAG rooms */
export const tagNames = [
  "Cooperative Cyber-Physical Social Systems and IoT",
  "Data Science / Data Analytics",
  "Evolutionary Optimization, Learning and Adaptive Systems",
  "Image Analysis and Pattern Recognition",
  "Knowledge Engineering and Semantic Computing",
  "Network Systems and Security",
  "Research & Innovation in Software Engineering",
  "Secure Camera Network Analytics",
  "Vision, Language and Intelligent Learning (VLIL)",
];

/**
 * Generates the complete layout data for a single floor.
 * @param {number} floorLevel - 0-indexed floor number.
 */
export const generateFloorData = (floorLevel) => {
  // Systematic numbering offset: Floor 0 -> 1xx, Floor 1 -> 2xx, etc.
  const displayNum = floorLevel + 1;

  const getRoomStatus = () => (Math.random() > 0.4 ? 'free' : 'occupied');
  const getFacultyStatus = () => (Math.random() > 0.3 ? 'present' : 'absent');

  // Labs strictly on the 3rd floor (index 3), classrooms on others
  const getRoomType = () => (floorLevel === 3 ? 'lab' : 'class');

  // ── Actual DB room names mapped to map positions ──
  // DB rooms: N-101, N-102, N-201, N-202, S-101, S-102, LAB-A, LAB-B, LAB-C, SEM-HALL
  const generateRooms = (count, group, level) => {
    // Custom Architectural Override for Floor 0 (D-Wing / topLeft)
    if (level === 0 && group === 'topLeft') {
      return [
        {
          id: 'S-101',
          title: 'S-101',
          subtitle: 'Lecture Hall',
          type: 'class',
          status: getRoomStatus(),
          detail: 'South Block – Large Lecture Hall',
          colClass: 'col-span-2',
        },
        {
          id: 'SEM-HALL',
          title: 'SEM-HALL',
          subtitle: 'Seminar Hall',
          type: 'class',
          status: getRoomStatus(),
          detail: 'Main Seminar & Conference Hall',
          colClass: 'col-span-3',
        },
      ];
    }

    // Map each floor-group combination to use real DB or realistic room names
    const roomNameMap = {
      'topLeft': ['N-201', 'N-202', 'S-102', `D-${displayNum}04`, `D-${displayNum}05`],
      'topRight': ['N-101', 'N-102', `C-${displayNum}03`, `C-${displayNum}04`, `C-${displayNum}05`],
      'bottomLeft': [`B-${displayNum}01`, `B-${displayNum}02`, `B-${displayNum}03`, `B-${displayNum}04`, `B-${displayNum}05`],
      'bottomRight': ['LAB-A', 'LAB-B', 'LAB-C', `A-${displayNum}04`, `A-${displayNum}05`],
    };

    // For floor 0, use actual DB room names; for higher floors, use floor-adjusted names
    const names = level === 0
      ? (roomNameMap[group] || [])
      : Array.from({ length: count }, (_, i) => {
        const wing = group === 'topLeft' ? 'D' : group === 'topRight' ? 'C' : group === 'bottomLeft' ? 'B' : 'A';
        return `${wing}-${displayNum}0${count - i}`;
      });

    return Array.from({ length: count }, (_, i) => {
      let id = names[i] || `R-${displayNum}${i}`;
      let customSubtitle = null;
      let forceType = null;

      if (group === 'bottomRight' && level === 2) {
        customSubtitle = 'Seminar Hall';
        forceType = 'class';
      }

      const type = forceType || (id.startsWith('LAB') ? 'lab' : getRoomType());
      return {
        id,
        type,
        status: getRoomStatus(),
        subtitle: customSubtitle || (type === 'lab' ? 'Lab' : 'Class'),
        detail: customSubtitle
          ? 'Event & Seminar Space'
          : type === 'lab'
            ? 'Technical Research Lab'
            : 'Lecture Hall',
        colClass: 'col-span-1',
      };
    });
  };

  const getTagName = (index) =>
    tagNames[
    (floorLevel > 0 ? (floorLevel - 1) * 4 + index : index) % tagNames.length
    ];

  // TAG spaces on upper floors
  const extraRooms =
    floorLevel > 0
      ? [
        { id: `E-${displayNum}01`, detail: getTagName(0), status: getRoomStatus(), pos: { top: 'calc(23% - 15px)', left: '10px' } },
        { id: `E-${displayNum}02`, detail: getTagName(1), status: getRoomStatus(), pos: { bottom: 'calc(23% - 15px)', left: '10px' } },
        { id: `E-${displayNum}03`, detail: getTagName(2), status: getRoomStatus(), pos: { bottom: 'calc(23% - 15px)', right: '10px' } },
        { id: `E-${displayNum}04`, detail: getTagName(3), status: getRoomStatus(), pos: { top: 'calc(23% - 15px)', right: '10px' } },
      ]
      : [];

  // ── Actual DB faculty names (from inputDataSetGenerator.js seed data) ──
  const leftFaculty = [
    'Dr. Smith', 'Prof. Johnson', 'Dr. Williams',
    'Mr. Brown', 'Ms. Davis', 'Dr. Miller',
    'Prof. Wilson', 'Dr. Taylor', 'Dr. Arun',
    'Prof. Meena', 'Dr. Karthik', 'Ms. Lakshmi',
  ];
  const rightFaculty = [
    'Dr. Suresh', 'Prof. Divya', 'Mr. Vijay',
    'Dr. Anitha', 'Mr. Deepak', 'Mr. Raghu Pradeep Nair',
    'Ms. Aparna', 'Mr. Kumar', 'Ms. Priya',
    'Mr. Rajan', 'Ms. Sneha', 'Mr. Harish',
  ];

  return {
    level: floorLevel,
    name: `Floor ${floorLevel}`,
    rooms: {
      topLeft: generateRooms(5, 'topLeft', floorLevel),
      topRight: generateRooms(5, 'topRight', floorLevel),
      bottomLeft: generateRooms(5, 'bottomLeft', floorLevel),
      // 3 Seminar Halls on Floor index 2, 5 rooms on all others
      bottomRight: generateRooms(floorLevel === 2 ? 3 : 5, 'bottomRight', floorLevel),
    },
    faculty: {
      leftBlock: leftFaculty.map((name, idx) => ({
        name,
        room: `F-${displayNum}${String(idx + 1).padStart(2, '0')}`,
        status: getFacultyStatus(),
        detail: 'Information Technology',
      })),
      rightBlock: rightFaculty.map((name, idx) => ({
        name,
        room: `F-${displayNum}${String(idx + 13).padStart(2, '0')}`,
        status: getFacultyStatus(),
        detail: 'Information Technology',
      })),
    },
    extraRooms,
  };
};

/** Pre-built data for all four floors (indices 0–3) */
export const buildingData = [0, 1, 2, 3].map(generateFloorData);
