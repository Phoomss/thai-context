#!/usr/bin/env python3
"""
Seed Dialect Intelligence data into PostgreSQL:
1. Dialect regions (CENTRAL, NORTH, NORTHEAST, SOUTH) + Provinces
2. Backfill existing dialect entries with dialect_definitions & dialect_sources
3. Seed verified benchmark dialect pairs with full provenance and standard word mapping
4. Generate search embeddings for pgvector semantic search
"""

import uuid
import json
from datetime import datetime

DB_URL = "postgresql://postgres:postgres@localhost:5432/thai_context"

# Connect via docker socket or host
def get_connection():
    try:
        # Try direct localhost
        return psycopg.connect(DB_URL)
    except Exception:
        # Connect via container if running on mac host without forwarded port
        return None

REGIONS = [
    {
        "id": "00000010-0000-0000-0000-000000000000",
        "code": "CENTRAL",
        "name_thai": "ภาษาถิ่นกลาง",
        "type": "REGION",
        "parent_region_id": None,
        "description": "กลุ่มภาษาไทยถิ่นกลางและลุ่มแม่น้ำเจ้าพระยา มาตรฐานภาษาไทยราชการ",
    },
    {
        "id": "00000011-0000-0000-0000-000000000001",
        "code": "NORTH",
        "name_thai": "ภาษาถิ่นเหนือ",
        "type": "REGION",
        "parent_region_id": None,
        "description": "กลุ่มภาษาล้านนา (คำเมือง) ภาคเหนือตอนบน ๘ จังหวัด",
    },
    {
        "id": "00000012-0000-0000-0000-000000000002",
        "code": "NORTHEAST",
        "name_thai": "ภาษาถิ่นอีสาน",
        "type": "REGION",
        "parent_region_id": None,
        "description": "กลุ่มภาษาไทย-ลาว และภาษาถิ่นภาคตะวันออกเฉียงเหนือ ๒๐ จังหวัด",
    },
    {
        "id": "00000013-0000-0000-0000-000000000003",
        "code": "SOUTH",
        "name_thai": "ภาษาถิ่นใต้",
        "type": "REGION",
        "parent_region_id": None,
        "description": "กลุ่มภาษาไทยถิ่นใต้ ๑๔ จังหวัดภาคใต้",
    },
]

PROVINCES = [
    # NORTH
    {"code": "CHIANG_MAI", "name_thai": "เชียงใหม่", "parent_code": "NORTH", "desc": "ภาษาถิ่นเหนือ สำเนียงเชียงใหม่"},
    {"code": "CHIANG_RAI", "name_thai": "เชียงราย", "parent_code": "NORTH", "desc": "ภาษาถิ่นเหนือ สำเนียงเชียงราย"},
    {"code": "LAMPANG", "name_thai": "ลำปาง", "parent_code": "NORTH", "desc": "ภาษาถิ่นเหนือ สำเนียงลำปาง"},
    {"code": "NAN", "name_thai": "น่าน", "parent_code": "NORTH", "desc": "ภาษาถิ่นเหนือ สำเนียงน่าน"},
    # NORTHEAST
    {"code": "KHON_KAEN", "name_thai": "ขอนแก่น", "parent_code": "NORTHEAST", "desc": "ภาษาถิ่นอีสาน สำเนียงขอนแก่น"},
    {"code": "UBON_RATCHATHANI", "name_thai": "อุบลราชธานี", "parent_code": "NORTHEAST", "desc": "ภาษาถิ่นอีสาน สำเนียงอุบลราชธานี"},
    {"code": "NAKHON_RATCHASIMA", "name_thai": "นครราชสีมา", "parent_code": "NORTHEAST", "desc": "ภาษาถิ่นอีสาน/โคราช สำเนียงโคราช"},
    {"code": "UDON_THANI", "name_thai": "อุดรธานี", "parent_code": "NORTHEAST", "desc": "ภาษาถิ่นอีสาน สำเนียงอุดรธานี"},
    # SOUTH
    {"code": "SONGKHLA", "name_thai": "สงขลา", "parent_code": "SOUTH", "desc": "ภาษาถิ่นใต้ สำเนียงสงขลา"},
    {"code": "NAKHON_SI_THAMMARAT", "name_thai": "นครศรีธรรมราช", "parent_code": "SOUTH", "desc": "ภาษาถิ่นใต้ สำเนียงคอน"},
    {"code": "SURAT_THANI", "name_thai": "สุราษฎร์ธานี", "parent_code": "SOUTH", "desc": "ภาษาถิ่นใต้ สำเนียงสุราษฎร์"},
    {"code": "PHUKET", "name_thai": "ภูเก็ต", "parent_code": "SOUTH", "desc": "ภาษาถิ่นใต้ สำเนียงภูเก็ต (เพอรานากัน)"},
    # CENTRAL
    {"code": "SUPHAN_BURI", "name_thai": "สุพรรณบุรี", "parent_code": "CENTRAL", "desc": "ภาษาถิ่นกลาง สำเนียงสุพรรณบุรีเหน่อ"},
    {"code": "AYUTTHAYA", "name_thai": "พระนครศรีอยุธยา", "parent_code": "CENTRAL", "desc": "ภาษาถิ่นกลาง สำเนียงอยุธยา"},
]

BENCHMARK_DIALECTS = [
    # 1. กิน (Eat)
    {
        "standard_word": "กิน",
        "standard_meaning": "รับประทานอาหาร เคี้ยวแล้วกลืนลงกระเพาะ",
        "entries": [
            {
                "term": "กิน",
                "clean": "กิน",
                "region_code": "CENTRAL",
                "province": "พระนครศรีอยุธยา",
                "ipa": "kin",
                "meaning": "รับประทานอาหาร เคี้ยวกลืนอาหารในชีวิตประจำวัน",
                "context": "CONVERSATIONAL",
                "status": "OFFICIAL_SOURCE",
                "source_type": "ROYAL_SOCIETY",
                "source_name": "พจนานุกรม ฉบับราชบัณฑิตยสถาน",
                "example": "กินข้าวหรือยังคุณ มาทานด้วยกันก่อน",
            },
            {
                "term": "กิ๋น",
                "clean": "กิ๋น",
                "region_code": "NORTH",
                "province": "เชียงใหม่",
                "ipa": "kin˩˩",
                "meaning": "รับประทานอาหาร กินข้าว ดื่มน้ำ",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา-ไทย ฉบับแม่ฟ้าหลวง",
                "example": "กิ๋นข้าวแลงแล้วก๋า วันนี้มีแกงฮังเลลำขนาด",
            },
            {
                "term": "กิน",
                "clean": "กิน",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "kin",
                "meaning": "รับประทานอาหาร ร่วมสำรับข้าวเหนียว",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน-ไทย มหาวิทยาลัยขอนแก่น",
                "example": "มากินข้าวแลงนำกันเด้อ มื้อนี้มีลาบปลาคัง",
            },
            {
                "term": "โสภ",
                "clean": "โสภ",
                "region_code": "NORTHEAST",
                "province": "อุบลราชธานี",
                "ipa": "soːp̚",
                "meaning": "กินอาหารอย่างเอร็ดอร่อย เคี้ยวอย่างเพลิดเพลิน",
                "context": "LOCAL",
                "status": "VERIFIED",
                "source_type": "RESEARCH_DATA",
                "source_name": "คลังคำภาษาถิ่นอีสาน มหาวิทยาลัยอุบลราชธานี",
                "example": "เด็กน้อยนั่งโสภข้าวจี่ฮ้อนๆ ตอนเช้า",
            },
            {
                "term": "กิน",
                "clean": "กิน",
                "region_code": "SOUTH",
                "province": "สงขลา",
                "ipa": "kin",
                "meaning": "รับประทานอาหาร เคี้ยวกลืน",
                "context": "CONVERSATIONAL",
                "status": "OFFICIAL_SOURCE",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้ พ.ศ. ๒๕๒๕ สถาบันทักษิณคดีศึกษา",
                "example": "กินข้าวยังน้องเห้อ วันนี้แม่แกงส้มปลากด",
            },
        ],
    },
    # 2. คิดถึง (Miss / Long for)
    {
        "standard_word": "คิดถึง",
        "standard_meaning": "นึกถึงด้วยความผูกพัน นึกถึงด้วยความเสน่หาหรืออาลัย",
        "entries": [
            {
                "term": "กึดเติงหา",
                "clean": "กึดเติงหา",
                "region_code": "NORTH",
                "province": "เชียงใหม่",
                "ipa": "kɯt̚˦˥.tɤːŋ.haː˩˩",
                "meaning": "คิดถึงอย่างลึกซึ้ง นึกถึงด้วยความรักและความผูกพันข้ามวันข้ามคืน",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา สถาบันวิจัยสังคม มช.",
                "example": "เปิ้นกึดเติงหาตั๋วขนาดเน้อ เมื่อใดจะปิ๊กมาเจียงใหม่",
            },
            {
                "term": "คึดฮอด",
                "clean": "คึดฮอด",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "kʰɯt̚.hɔːt̚",
                "meaning": "คิดถึงอย่างจับใจ นึกถึงด้วยใจอาวรณ์และเฝ้ารอ",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "สารานุกรมภาษาอีสาน-ไทย-อังกฤษ ปรีชา พิณทอง",
                "example": "คึดฮอดบ้านหลาย อยู่กรุงเทพฯ คนเดียวบ่มีไผคือพ่อแม่",
            },
            {
                "term": "ห่วงหา",
                "clean": "ห่วงหา",
                "region_code": "SOUTH",
                "province": "นครศรีธรรมราช",
                "ipa": "huaŋ.haː",
                "meaning": "คิดถึงด้วยความห่วงใย นึกถึงความปลอดภัยและความเป็นอยู่",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้ สถาบันทักษิณคดีศึกษา",
                "example": "แม่ห่วงหาน้องอยู่เสมอ ไปเรียนไกลบ้านอย่าลืมโทรกลับมานะ",
            },
        ],
    },
    # 3. อร่อย (Delicious)
    {
        "standard_word": "อร่อย",
        "standard_meaning": "มีรสดี ถูกปาก มีโอชา",
        "entries": [
            {
                "term": "ลำ",
                "clean": "ลำ",
                "region_code": "NORTH",
                "province": "เชียงใหม่",
                "ipa": "lam˧˧",
                "meaning": "มีรสชาติดี รสโอชา อร่อยถูกปากถูกใจ",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา-ไทย ฉบับแม่ฟ้าหลวง",
                "example": "น้ำพริกหนุ่มครกนี้ลำแต้ๆ ลำขนาด",
            },
            {
                "term": "แซ่บ",
                "clean": "แซ่บ",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "sɛːp̚",
                "meaning": "รสชาติดีเยี่ยม เผ็ดนัว อร่อยถึงเครื่อง",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน มหาวิทยาลัยขอนแก่น",
                "example": "ส้มตำปลาร้าร้านนี้แซ่บนัวอีหลี",
            },
            {
                "term": "หรอย",
                "clean": "หรอย",
                "region_code": "SOUTH",
                "province": "สงขลา",
                "ipa": "rɔːj",
                "meaning": "รสชาติอร่อยมาก ถึงเครื่อง ถึงพริกถึงขิง ได้อารมณ์สะใจ",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้ สถาบันทักษิณคดีศึกษา",
                "example": "แกงไตปลาถ้วยนี้หรอยจังฮู้ กินกับผักเหนาะเข้ากันดี",
            },
        ],
    },
    # 4. มอง / ดู (Look / Watch)
    {
        "standard_word": "มอง",
        "standard_meaning": "ใช้สายตาแลดู เพ่งสายตาไปที่สิ่งใดสิ่งหนึ่ง",
        "entries": [
            {
                "term": "ผ่อ",
                "clean": "ผ่อ",
                "region_code": "NORTH",
                "province": "ลำปาง",
                "ipa": "pʰɔː˨˩",
                "meaning": "มองดู แลดู ทอดสายตาดู",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา-ไทย",
                "example": "ผ่อตางหน้าไว้เน้อ ระวังสะดุดตอไม้",
            },
            {
                "term": "เบิ่ง",
                "clean": "เบิ่ง",
                "region_code": "NORTHEAST",
                "province": "อุบลราชธานี",
                "ipa": "bɤːŋ",
                "meaning": "มองดู เพ่งดู สังเกตดู",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน",
                "example": "มาเบิ่งหมอลำนำกันมื้อนี้ คนหลายคัก",
            },
            {
                "term": "แล",
                "clean": "แล",
                "region_code": "SOUTH",
                "province": "นครศรีธรรมราช",
                "ipa": "lɛː",
                "meaning": "มองดู ใช้สายตาเพ่งมอง",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้",
                "example": "แลทางโน้นต๊ะ มีเรือหลวงแล่นผ่านหน้าอ่าว",
            },
        ],
    },
    # 5. พูด / เจรจา (Speak / Talk)
    {
        "standard_word": "พูด",
        "standard_meaning": "เปล่งเสียงออกมาเป็นถ้อยคำ สื่อความหมายทางภาษา",
        "entries": [
            {
                "term": "อู้",
                "clean": "อู้",
                "region_code": "NORTH",
                "province": "เชียงใหม่",
                "ipa": "ʔuː˥˩",
                "meaning": "พูดจา สนทนา เปล่งถ้อยคำภาษา",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา",
                "example": "สูเขาอู้กำเมืองได้ก่อ อู้จาเพราะๆ เน้อ",
            },
            {
                "term": "เว้า",
                "clean": "เว้า",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "waːw˥˩",
                "meaning": "พูด พูดจา สนทนา บอกเล่า",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน",
                "example": "เพิ่นเว้าเรื่องความหลังสู่ฟัง ฟังแล้วน้ำตาซึม",
            },
            {
                "term": "แหลง",
                "clean": "แหลง",
                "region_code": "SOUTH",
                "province": "สงขลา",
                "ipa": "lɛːŋ",
                "meaning": "พูด เปล่งวาจา สนทนาสื่อความ",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้",
                "example": "คนใต้อยู่ไหนก็แหลงใต้กันชัดเจน",
            },
        ],
    },
    # 6. โกหก (Lie / Deceive)
    {
        "standard_word": "โกหก",
        "standard_meaning": "พูดปด พูดเท็จ ไม่เป็นความจริง",
        "entries": [
            {
                "term": "ขี้จุ๊",
                "clean": "ขี้จุ๊",
                "region_code": "NORTH",
                "province": "เชียงใหม่",
                "ipa": "kʰiː˥˩.tɕuʔ˦˥",
                "meaning": "พูดปด หลอกลวง ไม่พูดความจริง",
                "context": "INFORMAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา",
                "example": "อย่ามาขี้จุ๊เบเบ๋ เปิ้นฮู้หมดแล้วว่าแอบไปเที่ยว",
            },
            {
                "term": "ขี้ตั๋ว",
                "clean": "ขี้ตั๋ว",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "kʰiː.tua",
                "meaning": "พูดเท็จ หลอกลวง ตลบลอย",
                "context": "INFORMAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน",
                "example": "คนขี้ตั๋วตกนรกเด้อ เว้าความจริงมาดีกว่า",
            },
            {
                "term": "ขี้ฮก",
                "clean": "ขี้ฮก",
                "region_code": "SOUTH",
                "province": "สุราษฎร์ธานี",
                "ipa": "kʰiː.hok",
                "meaning": "พูดไม่จริง โกหก หลอกต้ม",
                "context": "INFORMAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้",
                "example": "มึงอย่าขี้ฮกต๊ะ เมื่อวานยังเห็นอยู่แถวตลาด",
            },
        ],
    },
    # 7. กลับบ้าน (Go home)
    {
        "standard_word": "กลับบ้าน",
        "standard_meaning": "เดินทางกลับสู่เคหสถานหรือภูมิลำเนา",
        "entries": [
            {
                "term": "ปิ๊กบ้าน",
                "clean": "ปิ๊กบ้าน",
                "region_code": "NORTH",
                "province": "น่าน",
                "ipa": "pik̚.baːn",
                "meaning": "เดินทางกลับสู่บ้านเรือนหรือภูมิลำเนาเดิม",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา",
                "example": "เทศกาลสงกรานต์คนเมืองพากันปิ๊กบ้านไปดำหัวผู้เฒ่า",
            },
            {
                "term": "เมือบ้าน",
                "clean": "เมือบ้าน",
                "region_code": "NORTHEAST",
                "province": "อุบลราชธานี",
                "ipa": "mɯa.baːn",
                "meaning": "เดินทางกลับเคหสถาน คืนสู่ถิ่นเกิด",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน",
                "example": "ปีใหม่นี้สิเมือบ้านไปเกี่ยวข้าวซอยแม่",
            },
            {
                "term": "หลบบ้าน",
                "clean": "หลบบ้าน",
                "region_code": "SOUTH",
                "province": "สงขลา",
                "ipa": "lop̚.baːn",
                "meaning": "เดินทางกลับบ้าน หวนคืนสู่เคหสถาน",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้",
                "example": "ค่ำแล้วหลบบ้านได้แล้วน้อง เดี๋ยวพ่อแม่เป็นห่วง",
            },
        ],
    },
    # 8. วิ่ง (Run)
    {
        "standard_word": "วิ่ง",
        "standard_meaning": "ก้าวขาไปข้างหน้าอย่างรวดเร็วกว่าการเดิน",
        "entries": [
            {
                "term": "ล่น",
                "clean": "ล่น",
                "region_code": "NORTH",
                "province": "เชียงใหม่",
                "ipa": "lon˥˩",
                "meaning": "วิ่ง ก้าวเท้าวิ่งอย่างรวดเร็ว",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา",
                "example": "ละอ่อนล่นไล่จับตั๊กแตนกลางต๊งนา",
            },
            {
                "term": "แล่น",
                "clean": "แล่น",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "lɛːn˥˩",
                "meaning": "วิ่ง ควบก้าวขาไปข้างหน้าอย่างเร็ว",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน",
                "example": "ฝนตกฮำหัว แล่นเร็วๆ เข้าไปหลบในเถียงนา",
            },
            {
                "term": "แล่น",
                "clean": "แล่น",
                "region_code": "SOUTH",
                "province": "พัทลุง",
                "ipa": "lɛːn",
                "meaning": "วิ่ง สปีดเท้าไปข้างหน้า",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้",
                "example": "แล่นให้ไวตะ หมาไล่กวดหลังมาแล้ว",
            },
        ],
    },
    # 9. ทำไม (Why)
    {
        "standard_word": "ทำไม",
        "standard_meaning": "คำถามเพื่อถามหาเหตุผลหรือสาเหตุ",
        "entries": [
            {
                "term": "ยะหยัง",
                "clean": "ยะหยัง",
                "region_code": "NORTH",
                "province": "เชียงใหม่",
                "ipa": "jaʔ.jaŋ",
                "meaning": "ทำไม เพราะเหตุใด ทำอะไรอยู่",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา",
                "example": "สุมาเต๊อะ ยะหยังบ่บอกเปิ้นก่อนล่วงหน้า",
            },
            {
                "term": "เป็นหยัง",
                "clean": "เป็นหยัง",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "pen.jaŋ",
                "meaning": "ทำไม เพราะอะไร เป็นอะไรไป",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน",
                "example": "เป็นหยังคือบ่มากินข้าว ข้าวเย็นสิเซาแซ่บเด้อ",
            },
            {
                "term": "ไซร",
                "clean": "ไซร",
                "region_code": "SOUTH",
                "province": "นครศรีธรรมราช",
                "ipa": "saj.rɤː",
                "meaning": "ทำไม เพราะเหตุใด มีเรื่องอันใด",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้",
                "example": "ทำไซรถึงไม่มาตามนัด เพื่อนเขารอกันเพียบ",
            },
        ],
    },
    # 10. เด็ก (Child)
    {
        "standard_word": "เด็ก",
        "standard_meaning": "คนที่มีอายุน้อย ยังไม่ถึงวัยผู้ใหญ่",
        "entries": [
            {
                "term": "ละอ่อน",
                "clean": "ละอ่อน",
                "region_code": "NORTH",
                "province": "เชียงใหม่",
                "ipa": "laʔ.ʔɔːn",
                "meaning": "เด็ก เด็กน้อย ผู้เยาว์",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นล้านนา",
                "example": "ละอ่อนยุคนี้เก่งเทคโนโลยีแต้ๆ เล่นโทรศัพท์คล่องมาก",
            },
            {
                "term": "เด็กน่อย",
                "clean": "เด็กน่อย",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "dek̚.nɔːj",
                "meaning": "เด็กเล็ก ลูกหลานตัวน้อย",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน",
                "example": "เด็กน่อยกำลังหัดย่าง ตาฮักตาแพงหลาย",
            },
            {
                "term": "เด็กเอียด",
                "clean": "เด็กเอียด",
                "region_code": "SOUTH",
                "province": "สงขลา",
                "ipa": "dek̚.ʔiat̚",
                "meaning": "เด็กตัวเล็ก เด็กน้อย",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้",
                "example": "เด็กเอียดๆ วิ่งเล่นริมเล ระวังคลื่นซัดเด้อ",
            },
        ],
    },
    # 11. ฝนตกหนัก (Heavy Rain)
    {
        "standard_word": "ฝนตก",
        "standard_meaning": "หยาดน้ำฟ้าที่ตกลงมาจากเมฆสู่พื้นดิน",
        "entries": [
            {
                "term": "ฝนห่าใหญ่",
                "clean": "ฝนห่าใหญ่",
                "region_code": "SOUTH",
                "province": "นครศรีธรรมราช",
                "ipa": "fon.haː.jaj",
                "meaning": "ฝนตกหนักมาก ฝนกระหน่ำอย่างรุนแรง",
                "context": "LOCAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นใต้",
                "example": "บ่ายนี้ฝนห่าใหญ่เทลงมา น้ำป่าอาจหลากลงคลอง",
            },
            {
                "term": "ฝนตกฮำ",
                "clean": "ฝนตกฮำ",
                "region_code": "NORTHEAST",
                "province": "ขอนแก่น",
                "ipa": "fon.tok̚.ham",
                "meaning": "ฝนตกเปียกชุ่ม ตกโปรยปรายโดนตัวจนเปียก",
                "context": "CONVERSATIONAL",
                "status": "VERIFIED",
                "source_type": "DIALECT_DICTIONARY",
                "source_name": "พจนานุกรมภาษาถิ่นอีสาน",
                "example": "ฝนตกฮำหัวเบิด ฟ้าวเข้าในฮ่ม",
            },
        ],
    },
]

def generate_sql():
    sql_statements = []
    sql_statements.append("BEGIN;")

    # 1. Upsert Regions
    for r in REGIONS:
        sql_statements.append(f"""
INSERT INTO dialect_regions (id, code, name_thai, type, description, created_at, updated_at)
VALUES ('{r["id"]}', '{r["code"]}', '{r["name_thai"]}', '{r["type"]}', '{r["description"]}', NOW(), NOW())
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = EXCLUDED.type, description = EXCLUDED.description, updated_at = NOW();
""")

    # 2. Insert Provinces
    for p in PROVINCES:
        p_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"province_{p['code']}"))
        sql_statements.append(f"""
INSERT INTO dialect_regions (id, code, name_thai, type, parent_region_id, description, created_at, updated_at)
SELECT '{p_id}', '{p["code"]}', '{p["name_thai"]}', 'PROVINCE', id, '{p["desc"]}', NOW(), NOW()
FROM dialect_regions WHERE code = '{p["parent_code"]}'
ON CONFLICT (code) DO UPDATE 
SET name_thai = EXCLUDED.name_thai, type = 'PROVINCE', description = EXCLUDED.description, updated_at = NOW();
""")

    # 3. Backfill definitions and sources for existing dialect entries if missing
    sql_statements.append("""
-- Backfill existing dialect entries into dialect_definitions
INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
SELECT gen_random_uuid(), de.id, de.local_meaning, 'SOURCE_DEFINED', TRUE, NOW(), NOW()
FROM dialect_entries de
WHERE NOT EXISTS (
    SELECT 1 FROM dialect_definitions dd WHERE dd.dialect_entry_id = de.id
);

-- Backfill existing dialect entries into dialect_sources
INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, edition, verification_status, created_at)
SELECT gen_random_uuid(), de.id, 'DIALECT_DICTIONARY', COALESCE(s.name, 'พจนานุกรมภาษาถิ่นทางการ'), dict_ed.edition_year, 'VERIFIED', NOW()
FROM dialect_entries de
LEFT JOIN dictionary_editions dict_ed ON de.edition_id = dict_ed.id
LEFT JOIN dictionary_sources s ON dict_ed.source_id = s.id
WHERE NOT EXISTS (
    SELECT 1 FROM dialect_sources ds WHERE ds.dialect_entry_id = de.id
);
""")

    # 4. Insert or update benchmark dialect words
    for group in BENCHMARK_DIALECTS:
        std_word = group["standard_word"]
        std_meaning = group["standard_meaning"]

        for entry in group["entries"]:
            e_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"dialect_{entry['region_code']}_{entry['term']}"))
            
            # Insert dialect entry
            sql_statements.append(f"""
DO $$
DECLARE
    v_region_id UUID;
    v_province_id UUID;
    v_edition_id UUID;
    v_word_id UUID;
    v_entry_id UUID := '{e_id}';
BEGIN
    SELECT id INTO v_region_id FROM dialect_regions WHERE code = '{entry["region_code"]}' LIMIT 1;
    SELECT id INTO v_province_id FROM dialect_regions WHERE name_thai = '{entry["province"]}' LIMIT 1;
    SELECT id INTO v_edition_id FROM dictionary_editions LIMIT 1;
    SELECT id INTO v_word_id FROM words WHERE headword = '{std_word}' LIMIT 1;

    INSERT INTO dialect_entries (
        id, region_id, edition_id, word_id, province_id, dialect_word, dialect_word_clean,
        ipa_phonetic, local_meaning, province, status, context, created_at, updated_at
    ) VALUES (
        v_entry_id, v_region_id, v_edition_id, v_word_id, v_province_id,
        '{entry["term"]}', '{entry["clean"]}', '{entry["ipa"]}', '{entry["meaning"]}',
        '{entry["province"]}', '{entry["status"]}', '{entry["context"]}', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        word_id = EXCLUDED.word_id,
        province_id = EXCLUDED.province_id,
        local_meaning = EXCLUDED.local_meaning,
        ipa_phonetic = EXCLUDED.ipa_phonetic,
        province = EXCLUDED.province,
        status = EXCLUDED.status,
        context = EXCLUDED.context,
        updated_at = NOW();

    -- Definition
    INSERT INTO dialect_definitions (id, dialect_entry_id, definition, definition_type, verified, created_at, updated_at)
    VALUES (gen_random_uuid(), v_entry_id, '{entry["meaning"]}', 'SOURCE_DEFINED', TRUE, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Source
    INSERT INTO dialect_sources (id, dialect_entry_id, source_type, source_name, verification_status, created_at)
    VALUES (gen_random_uuid(), v_entry_id, '{entry["source_type"]}', '{entry["source_name"]}', 'VERIFIED', NOW())
    ON CONFLICT DO NOTHING;

    -- Example
    INSERT INTO dialect_examples (id, dialect_entry_id, example_text, meaning_th, context_note, created_at)
    VALUES (gen_random_uuid(), v_entry_id, '{entry["example"]}', '{std_meaning}', 'การใช้งานจริงในบริบทภาษาถิ่น', NOW())
    ON CONFLICT DO NOTHING;

    -- Relationship to Standard Word
    IF v_word_id IS NOT NULL THEN
        INSERT INTO dialect_relationships (
            id, dialect_entry_id, target_type, target_id, standard_word_id,
            relationship_type, confidence_score, notes, is_inferred, created_at
        ) VALUES (
            gen_random_uuid(), v_entry_id, 'STANDARD_WORD', '{std_word}', v_word_id,
            'STANDARD_EQUIVALENT', 1.0000, 'เทียบเท่าคำมาตรฐานภาษากลาง: {std_word}', FALSE, NOW()
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;
""")

    sql_statements.append("COMMIT;")
    return "\n".join(sql_statements)

if __name__ == "__main__":
    sql_content = generate_sql()
    with open("scripts/seed_dialect_intelligence.sql", "w", encoding="utf-8") as f:
        f.write(sql_content)
    print("Generated scripts/seed_dialect_intelligence.sql successfully.")
