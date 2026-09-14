import Icon from "../ui/Icon";
export default function CapabilityStrip() {
  return <nav className="capability-strip" aria-label="สำรวจความสามารถ">
    <a href="#meaning"><Icon name="search" /><span>ค้นจากความหมาย</span></a>
    <a href="#search-results"><Icon name="book" /><span>เข้าใจบริบทการใช้</span></a>
    <a href="#compare"><Icon name="compare" /><span>เปรียบเทียบคำ</span></a>
    <a href="#evolution"><Icon name="arrow" /><span>สำรวจการเดินทางของคำ</span></a>
    <a href="#search-results"><Icon name="source" /><span>ตรวจสอบแหล่งที่มา</span></a>
  </nav>;
}
