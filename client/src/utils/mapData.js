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

  const getRoomStatus    = () => (Math.random() > 0.4 ? 'free'    : 'occupied');
  const getFacultyStatus = () => (Math.random() > 0.3 ? 'present' : 'absent');

  // Labs strictly on the 3rd floor (index 3), classrooms on others
  const getRoomType = () => (floorLevel === 3 ? 'lab' : 'class');

  const generateRooms = (count, group, level) => {
    // Custom Architectural Override for Floor 0 (D-Wing / topLeft)
    if (level === 0 && group === 'topLeft') {
      return [
        {
          id: 'D-BigClass',
          title: 'Big Class',
          subtitle: 'D-104 / 105',
          type: 'class',
          status: getRoomStatus(),
          detail: 'Combined Lecture Hall',
          colClass: 'col-span-2',
        },
        {
          id: 'Anugraha-Hall',
          title: 'Anugraha Hall',
          subtitle: 'D-101 to 103',
          type: 'class',
          status: getRoomStatus(),
          detail: 'Main Conference & Seminar Hall',
          colClass: 'col-span-3',
        },
      ];
    }

    return Array.from({ length: count }, (_, i) => {
      let id;
      let customSubtitle = null;
      let forceType = null;
      const posIndex = i;

      if (group === 'bottomLeft') {
        id = `B-${displayNum}0${count - posIndex}`;
      } else if (group === 'bottomRight') {
        id = `A-${displayNum}0${count - posIndex}`;
        // Seminar Halls ONLY on Floor index 2 (Display Floor 3)
        if (level === 2) {
          customSubtitle = 'Seminar Hall';
          forceType = 'class';
        }
      } else if (group === 'topRight') {
        id = `C-${displayNum}0${count - posIndex}`;
      } else if (group === 'topLeft') {
        id = `D-${displayNum}0${count - posIndex}`;
      }

      const type = forceType || getRoomType();
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

  const leftFaculty = [
    'Dr. Geetha M.',       'Dr. Krishnakumar N.', 'Dr. Prema V.',
    'Dr. Somasundaram K.', 'Dr. Jyothi R.',        'Dr. Prashant R.',
    'Dr. Suresh B.',       'Dr. Kavitha P.',       'Dr. Ramesh T.',
    'Dr. Vidya S.',        'Dr. Sanjay A.',        'Dr. Rekha S.',
  ];
  const rightFaculty = [
    'Dr. Ananda Kumar S.', 'Dr. Priya Srinivasan', 'Dr. Rajeev K.',
    'Dr. Arun P.',          'Dr. Meera N.',          'Dr. Karthik S.',
    'Dr. Ganesh V.',        'Dr. Deepa R.',          'Dr. Vijay K.',
    'Dr. Lakshmi N.',       'Dr. Manish P.',         'Dr. Sunita G.',
  ];

  return {
    level: floorLevel,
    name: `Floor ${floorLevel}`,
    rooms: {
      topLeft:     generateRooms(5, 'topLeft',     floorLevel),
      topRight:    generateRooms(5, 'topRight',    floorLevel),
      bottomLeft:  generateRooms(5, 'bottomLeft',  floorLevel),
      // 3 Seminar Halls on Floor index 2, 5 rooms on all others
      bottomRight: generateRooms(floorLevel === 2 ? 3 : 5, 'bottomRight', floorLevel),
    },
    faculty: {
      leftBlock: leftFaculty.map((name, idx) => ({
        name,
        room:   `F-${displayNum}${String(idx + 1).padStart(2, '0')}`,
        status: getFacultyStatus(),
        detail: 'Information Technology',
      })),
      rightBlock: rightFaculty.map((name, idx) => ({
        name,
        room:   `F-${displayNum}${String(idx + 13).padStart(2, '0')}`,
        status: getFacultyStatus(),
        detail: 'Information Technology',
      })),
    },
    extraRooms,
  };
};

/** Pre-built data for all four floors (indices 0–3) */
export const buildingData = [0, 1, 2, 3].map(generateFloorData);
