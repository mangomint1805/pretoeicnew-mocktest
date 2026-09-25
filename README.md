# Pre TOEIC Mock Test

Trang làm bài kiểm tra trực tuyến cho lớp **TOEIC Pre** (giáo trình mới).

👉 **Trang làm bài:** https://mangomint1805.github.io/pretoeicnew-mocktest/

---

## Dành cho học viên

Mở đường link ở trên, chọn bài thầy đã giao rồi bấm **Làm bài**.

**Trước khi làm bài:**

- Có thể làm trên máy tính hoặc điện thoại. Bài có phần nghe thì chuẩn bị tai nghe.
- Nhập đúng **họ tên** và **lớp** để thầy nhận được kết quả.
- Tắt thông báo, không chuyển ứng dụng, không chuyển tab và không để màn hình tự tắt. Những thao tác này sẽ bị tính là vi phạm, vi phạm 5 lần bài sẽ tự động nộp.
- Phần nghe chỉ phát **một lần**, không tua và không tạm dừng.
- Nộp bài xong, điểm sẽ hiện ngay trên màn hình. Có thể làm lại nhiều lần, mỗi lần nộp đều được gửi cho thầy.

## Các bài kiểm tra

| Buổi | Bài | Nội dung | Trạng thái |
|---|---|---|---|
| 3 | Mock Test 1 · Part 1 | Photographs · 6 câu · 8 phút | ✅ Đã mở |
| 6 | Mock Test 2 · Part 5 | Incomplete Sentences · 30 câu | ⏳ Chưa mở |
| 9 | Mock Test 3 · Part 6 | Text Completion · 16 câu | ⏳ Chưa mở |
| 11 | Progress Test 1 | Kiểm tra giữa khóa | ⏳ Chưa mở |
| 13 | Mock Test 4 · Part 2 | Question–Response · 25 câu | ⏳ Chưa mở |
| 16 | Mock Test 5 · Part 3 | Conversations · 39 câu | ⏳ Chưa mở |
| 19 | Mock Test 6 · Part 7 | Reading Comprehension · 29 câu | ⏳ Chưa mở |
| 24 | Progress Test 2 | Kiểm tra cuối khóa | ⏳ Chưa mở |

---

## Ghi chú cho giáo viên

**Các file trong repo:**

- `index.html` là trang chủ, hiện danh sách bài theo lịch học.
- Mỗi bài kiểm tra là một file `.html` riêng, ví dụ `PRE TOEIC MOCK TEST 1 PART 1 - EXAM.html`.
- Đáp án **không** nằm trong các file này. Bài được chấm trên Google Apps Script, kết quả gửi về Google Sheet, mỗi bài một tab riêng.

**Mở thêm một bài mới:**

1. Thêm mã đề, tên tab và đáp án của bài mới vào Google Apps Script, chạy `setup`, rồi triển khai **phiên bản mới** (giữ nguyên đường link web app).
2. Upload file bài kiểm tra vào repo: **Add file → Upload files → Commit changes**.
3. Mở `index.html` → bấm ✏️, tìm dòng của bài đó và điền đúng tên file vào `file: ""`, rồi commit.
4. Đợi 1–2 phút, vào trang làm bài thử một lần, kiểm tra kết quả đã về Google Sheet thì xóa dòng thử đó đi.
