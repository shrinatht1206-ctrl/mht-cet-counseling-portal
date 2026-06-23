const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const colleges = [
  { code: '1001', name: 'College of Engineering Pune', city: 'Pune' },
  { code: '1002', name: 'Vishwakarma Institute of Technology', city: 'Pune' },
  { code: '1003', name: 'Pune Institute of Computer Technology', city: 'Pune' },
  { code: '1004', name: 'Savitribai Phule Pune University', city: 'Pune' },
  { code: '1005', name: 'Bharati Vidyapeeth College of Engineering', city: 'Pune' },
  { code: '1006', name: 'Maharashtra Institute of Technology', city: 'Pune' },
  { code: '1007', name: 'Dr. D.Y. Patil Institute of Technology', city: 'Pune' },
  { code: '1008', name: 'Sinhgad College of Engineering', city: 'Pune' },
  { code: '1009', name: 'Vishwakarma Institute of Information Technology', city: 'Pune' },
  { code: '1010', name: 'Pimpri Chinchwad College of Engineering', city: 'Pimpri' },
  { code: '1011', name: 'Army Institute of Technology', city: 'Pune' },
  { code: '1012', name: 'K.J. Somaiya Institute of Engineering', city: 'Mumbai' },
  { code: '1013', name: 'Veermata Jijabai Technological Institute', city: 'Mumbai' },
  { code: '1014', name: 'Thadomal Shahani Engineering College', city: 'Mumbai' },
  { code: '1015', name: 'Sardar Patel Institute of Technology', city: 'Mumbai' },
  { code: '1016', name: 'Don Bosco Institute of Technology', city: 'Mumbai' },
  { code: '1017', name: 'Fr. Conceicao Rodrigues College of Engineering', city: 'Mumbai' },
  { code: '1018', name: 'Dwarkadas J. Sanghvi College of Engineering', city: 'Mumbai' },
  { code: '1019', name: 'K.J. Somaiya College of Engineering', city: 'Mumbai' },
  { code: '1020', name: 'Smt. Indira Gandhi College of Engineering', city: 'Mumbai' },
  { code: '1021', name: 'Ramrao Adik Institute of Technology', city: 'Navi Mumbai' },
  { code: '1022', name: 'SIES Graduate School of Technology', city: 'Navi Mumbai' },
  { code: '1023', name: 'Terna Engineering College', city: 'Navi Mumbai' },
  { code: '1024', name: 'Bharati Vidyapeeth College of Engineering', city: 'Navi Mumbai' },
  { code: '1025', name: 'Vidyavardhini College of Engineering', city: 'Thane' },
  { code: '1026', name: 'Shah and Anchor Kutchhi Engineering College', city: 'Mumbai' },
  { code: '1027', name: 'Atharva College of Engineering', city: 'Mumbai' },
  { code: '1028', name: 'G.H. Raisoni College of Engineering', city: 'Nagpur' },
  { code: '1029', name: 'Yeshwantrao Chavan College of Engineering', city: 'Nagpur' },
  { code: '1030', name: 'G.H. Raisoni Institute of Engineering', city: 'Nagpur' },
  { code: '1031', name: 'K.D.K. College of Engineering', city: 'Nagpur' },
  { code: '1032', name: 'Smt. Kashibai Navale College of Engineering', city: 'Pune' },
  { code: '1033', name: 'MIT Academy of Engineering', city: 'Pune' },
  { code: '1034', name: 'Smt. Kashibai Navale College of Engineering', city: 'Pune' },
  { code: '1035', name: 'Sandip Foundation College of Engineering', city: 'Nashik' },
  { code: '1036', name: 'K.K. Wagh Institute of Engineering', city: 'Nashik' },
  { code: '1037', name: 'Mahatma Gandhi Mission College of Engineering', city: 'Nashik' },
  { code: '1038', name: 'Jawahar Education Society College of Engineering', city: 'Nashik' },
  { code: '1039', name: 'G.S. Mandal College of Engineering', city: 'Chhatrapati Sambhajinagar' },
  { code: '1040', name: 'Vishwabharati Academy College of Engineering', city: 'Chhatrapati Sambhajinagar' },
  { code: '1041', name: 'Shreeyash College of Engineering', city: 'Chhatrapati Sambhajinagar' },
  { code: '1042', name: 'P.R. Pote College of Engineering', city: 'Amravati' },
  { code: '1043', name: 'Sipna College of Engineering', city: 'Amravati' },
  { code: '1044', name: 'Prof. Ram Meghe College of Engineering', city: 'Amravati' },
  { code: '1045', name: 'Walchand College of Engineering', city: 'Sangli' },
  { code: '1046', name: 'Bharati Vidyapeeth College of Engineering', city: 'Sangli' },
  { code: '1047', name: 'Rajarambapu Institute of Technology', city: 'Sangli' },
  { code: '1048', name: 'Sanjay Ghodawat Institute of Technology', city: 'Sangli' },
  { code: '1049', name: 'Shivaji University College of Engineering', city: 'Kolhapur' },
  { code: '1050', name: 'D.Y. Patil College of Engineering', city: 'Kolhapur' },
  { code: '1051', name: 'Bharati Vidyapeeth College of Engineering', city: 'Kolhapur' },
  { code: '1052', name: 'Kolhapur Institute of Technology', city: 'Kolhapur' },
  { code: '1053', name: 'Walchand College of Engineering', city: 'Sangli' },
  { code: '1054', name: 'Sangamner College of Engineering', city: 'Nashik' },
  { code: '1055', name: 'Smt. Kashibai Navale College of Engineering', city: 'Pune' },
  { code: '1056', name: 'Zeal College of Engineering', city: 'Pune' },
  { code: '1057', name: 'Rajarshi Shahu College of Engineering', city: 'Pune' },
  { code: '1058', name: 'Vishwabharati Academy College of Engineering', city: 'Chhatrapati Sambhajinagar' },
  { code: '1059', name: 'Kalyani Charitable Trust College of Engineering', city: 'Pune' },
  { code: '1060', name: 'R.H. Sapat College of Engineering', city: 'Nashik' },
  { code: '1061', name: 'K.C.E. Society College of Engineering', city: 'Nashik' },
  { code: '1062', name: 'G.H. Raisoni College of Engineering', city: 'Nagpur' },
  { code: '1063', name: 'Priyadarshini College of Engineering', city: 'Nagpur' },
  { code: '1064', name: 'Laxminarayan Institute of Technology', city: 'Nagpur' },
  { code: '1065', name: 'Modern Education College of Engineering', city: 'Pune' },
  { code: '1066', name: 'Smt. Kashibai Navale College of Engineering', city: 'Pune' },
  { code: '1067', name: 'Sinhgad College of Engineering', city: 'Pune' },
  { code: '1068', name: 'Pune Institute of Computer Technology', city: 'Pune' },
  { code: '1069', name: 'Maharashtra Institute of Technology', city: 'Pune' },
  { code: '1070', name: 'Dr. D.Y. Patil Institute of Technology', city: 'Pune' },
  { code: '1071', name: 'Vishwakarma Institute of Technology', city: 'Pune' },
  { code: '1072', name: 'Bharati Vidyapeeth College of Engineering', city: 'Pune' },
  { code: '1073', name: 'College of Engineering Pune', city: 'Pune' },
  { code: '1074', name: 'Army Institute of Technology', city: 'Pune' },
  { code: '1075', name: 'K.J. Somaiya Institute of Engineering', city: 'Mumbai' },
  { code: '1076', name: 'Veermata Jijabai Technological Institute', city: 'Mumbai' },
  { code: '1077', name: 'Thadomal Shahani Engineering College', city: 'Mumbai' },
  { code: '1078', name: 'Sardar Patel Institute of Technology', city: 'Mumbai' },
  { code: '1079', name: 'Don Bosco Institute of Technology', city: 'Mumbai' },
  { code: '1080', name: 'Fr. Conceicao Rodrigues College of Engineering', city: 'Mumbai' },
];

const branches = [
  'Computer Engineering', 'Computer Science', 'CSE', 'Information Technology', 'IT',
  'Artificial Intelligence', 'Data Science', 'AIML', 'Computer Science & Design',
  'Electronics & Telecommunication', 'EnTC', 'Electronics', 'Electrical',
  'Mechanical', 'Civil', 'Chemical', 'Automobile'
];

const seatTypes = [
  'GOPENS', 'LOPENS', 'GOPENH', 'GOPENO', 'LOPENH', 'LOPENO',
  'GOBCS', 'LOBCS', 'EWS', 'TFWS',
  'GSCS', 'LSCS', 'GSTS', 'LSTS',
  'GNT1S', 'LNT1S', 'GNT2S', 'LNT2S', 'GNT3S', 'LNT3S', 'GVJS', 'LVJS',
  'GSEBCS', 'LSEBCS',
  'DEFOPENS', 'DEFOBCS', 'DEFSCS', 'DEFSTS',
  'PWDOPENS', 'PWDOBCS', 'PWDSCS', 'PWDSTS',
  'AI', 'MI', 'ORPHAN'
];

const years = [2022, 2023, 2024, 2025];

function generateData() {
  const data = [];
  
  for (const year of years) {
    for (const college of colleges) {
      for (const branch of branches) {
        const baseCutoff = 40 + Math.random() * 55;
        const yearTrend = (year - 2022) * (Math.random() * 3 - 0.5);
        const seatTypeCount = Math.floor(Math.random() * 5) + 1;
        const shuffledSeats = [...seatTypes].sort(() => Math.random() - 0.5).slice(0, seatTypeCount);
        
        for (const seatType of shuffledSeats) {
          let seatAdjustment = 0;
          if (seatType.startsWith('GO')) seatAdjustment = 0;
          else if (seatType.startsWith('LO')) seatAdjustment = -5;
          else if (seatType.includes('OBC')) seatAdjustment = -8;
          else if (seatType.includes('SC') || seatType.includes('ST')) seatAdjustment = -15;
          else if (seatType.includes('NT') || seatType.includes('VJ')) seatAdjustment = -10;
          else if (seatType.includes('EWS')) seatAdjustment = -3;
          else if (seatType.includes('TFWS')) seatAdjustment = -2;
          else if (seatType.includes('DEF')) seatAdjustment = -12;
          else if (seatType.includes('PWD')) seatAdjustment = -18;
          else if (seatType === 'AI') seatAdjustment = 2;
          else if (seatType === 'MI') seatAdjustment = -1;
          else if (seatType === 'ORPHAN') seatAdjustment = -20;
          
          const cutoff = Math.min(99.9, Math.max(1, baseCutoff + yearTrend + seatAdjustment + (Math.random() * 2 - 1)));
          
          data.push({
            year: year,
            college_code: college.code,
            college_name: college.name,
            city: college.city,
            branch: branch,
            seat_type: seatType,
            cutoff_percentile: parseFloat(cutoff.toFixed(2))
          });
        }
      }
    }
  }
  
  return data;
}

const allData = generateData();

const chunks = [];
const chunkSize = Math.ceil(allData.length / 9);
for (let i = 0; i < 9; i++) {
  chunks.push(allData.slice(i * chunkSize, (i + 1) * chunkSize));
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

for (let i = 0; i < 9; i++) {
  const ws = XLSX.utils.json_to_sheet(chunks[i]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, path.join(publicDir, `CET_PART_${i + 1}.xlsx`));
}

const aiData = allData.filter(d => d.seat_type === 'AI');
const aiCsv = [
  'year,college_code,college_name,city,branch,seat_type,cutoff_percentile',
  ...aiData.map(row => 
    `${row.year},${row.college_code},${row.college_name},${row.city},${row.branch},${row.seat_type},${row.cutoff_percentile}`
  )
].join('\n');

fs.writeFileSync(path.join(publicDir, 'MHT_CET_Cutoff_2022_2025_AI_Unified.csv'), aiCsv);

console.log('Generated data files:');
console.log(`- ${allData.length} total records`);
console.log(`- ${aiData.length} AI records`);
console.log(`- 9 Excel chunks with ~${chunkSize} records each`);
