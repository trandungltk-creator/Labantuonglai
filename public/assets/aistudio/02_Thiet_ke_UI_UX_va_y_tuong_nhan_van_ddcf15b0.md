# LA BÀN TƯƠNG LAI — Thiết kế trải nghiệm và giao diện Flutter

**Tầm nhìn sản phẩm 3.0 (đề xuất)** · Dữ liệu phiếu 2.0, quy tắc 2.0.1 · Học sinh THPT 15–18 tuổi

Thông điệp: **Hiểu mình — Hiểu nghề — Hiểu bối cảnh — Hành động.**
Tagline đề xuất: *Mỗi trải nghiệm, một bước hiểu mình.*

Đây là đặc tả giao diện để lập trình, không phải ngân hàng câu hỏi mới hay công cụ đã kiểm định. Mọi nội dung đo lấy từ `01_Ngan_hang_206_muc_CHUAN.md` và JSON chuẩn; mọi luật lấy từ tài liệu 03. Không đổi mã để phù hợp giao diện. Các tính năng mới dưới đây chưa được thực nghiệm. Ưu tiên một ứng dụng chạy hoàn chỉnh, an toàn, dễ dùng trên điện thoại Android phổ thông thay vì nhiều màn hình đẹp nhưng không hoạt động.

## 1. Ngôn ngữ thiết kế

- Phong cách Material 3, hiện đại, tinh tế, gần gũi tuổi 15–18, có khoảng thở; tránh giao diện bệnh viện, bảng điểm, hiệu ứng game gây lệ thuộc.
- Biểu tượng: la bàn cách điệu với một đường đi mở, không vẽ một đích nghề duy nhất. Icon vector đơn giản, nét nhất quán, không dùng ảnh học sinh thật mặc định.
- Màu sáng: nền #F5F8F7, mặt thẻ #FFFFFF, chủ đạo #006B60, chữ chính #143D39, chữ phụ #52635F, viền #D4E2DE; xanh dương #245B91 cho thông tin, vàng đất #8A5A16 cho lưu ý, đỏ #B42318 chỉ dùng cho tình huống cần hỗ trợ khẩn hoặc lỗi nghiêm trọng. Không tô đỏ điểm thấp, không dùng màu để phân loại học sinh. Chủ đề tối: nền #101C1A, mặt thẻ #192B27, chữ #E7F4EF, chủ đạo #78D9C7; kiểm tra tương phản ở cả hai theme.
- Typography: dùng font hệ thống hỗ trợ tiếng Việt hoặc Noto Sans với giấy phép phù hợp, đóng gói nội bộ nếu cần; không tải font qua mạng lúc chạy. Tiêu đề 24sp/32, mục 20sp/28, nội dung 16sp/24, chú thích 14sp/20, nút 16sp. Hỗ trợ cỡ chữ hệ thống tới 200%, không cắt chữ.
- Lưới 4/8dp, padding 16–24dp, góc thẻ 16dp, nút tối thiểu 48dp, ưu tiên cuộn dọc; tránh nút sát cạnh, modal liên tiếp, văn bản quá dày. Có label đọc màn hình, thứ tự focus hợp lý; biểu đồ có bảng số, không chỉ dựa màu.
- Chuyển động 150–250ms nhẹ nhàng và tắt được. Không âm thanh bắt buộc, quảng cáo, pop-up ép hoàn thành, bảng xếp hạng, streak, điểm thưởng cho việc tiết lộ riêng tư. Không dùng lời hứa tìm ra nghề định mệnh hoặc “điểm hạnh phúc”.

## 2. Điều hướng

Bottom navigation 5 mục: **Hôm nay | Khám phá | Hồ sơ | Kế hoạch | Em**. Màn hình `Em cần hỗ trợ` luôn truy cập được từ header và mục Em. Màn hình nghiên cứu M không xuất hiện trong hành trình cá nhân, chỉ có chế độ nghiên cứu riêng sau phê duyệt; MVP có thể tắt hẳn. Học sinh không cần đăng nhập, không buộc làm 206 mục một lần.

### 00 — Onboarding và quyền riêng tư

- 3 thẻ ngắn: “Hiểu mình bằng trải nghiệm”, “Không có điểm nào định nghĩa em”, “Em có quyền dừng, bỏ qua và giữ riêng”.
- Mô tả app không thay thế người tham vấn hoặc dịch vụ khẩn cấp, không theo dõi nhật ký, không tự liên hệ giáo viên/cha mẹ; chỉ lưu trên thiết bị theo thiết kế đã được kiểm tra. Trình bày dữ liệu nào lưu, mục đích, cách xóa, giới hạn bảo mật, sự khác nhau giữa bản dùng cá nhân và quy trình trường học.
- Chọn khối 10/11/12 (có thể bỏ qua); không hỏi tên, điện thoại, ngày sinh chính xác, trường, GPS. Chọn mã hồ sơ ngẫu nhiên nếu cần. Có nút “Dùng dữ liệu minh họa” và “Tiếp tục”; trong bản thử chỉ dữ liệu giả lập, không mời học sinh thật.
- Không ép đồng thuận gộp. Quyền lưu/tiếp tục được giải thích riêng; quy trình đồng thuận của trường phải được xác lập trước khi thử nghiệm thật. Truy cập thông tin hỗ trợ và chính sách riêng tư không cần đồng thuận khảo sát.

### 01 — Hôm nay

Wireframe:
```
[La bàn]  LA BÀN TƯƠNG LAI                  [Trợ giúp]
Chào em, hôm nay em muốn khám phá điều gì?
┌─────────────────────────────────────────────┐
│ LA BÀN 14 · Hành trình tự chọn              │
│ Một bước nhỏ cũng là một trải nghiệm.       │
│ 2/7 nhiệm vụ đã hoàn thành (không xếp hạng) │
│ [Tiếp tục]        [Đổi nhiệm vụ]             │
└─────────────────────────────────────────────┘
[Hiểu mình] [Khám phá nghề] [Thử một nhiệm vụ]
Việc em đã chọn: ...        [Xem kế hoạch]
[Em cần hỗ trợ]     [Quyền riêng tư]
```

Không hiển thị phần trăm “độ hoàn thiện con người”. Thanh tiến độ chỉ đếm mục trả lời hoặc việc đã làm, gồm cả trạng thái bỏ qua. Có trạng thái mới, đang làm, chưa đủ dữ liệu, đã có báo cáo; không chế giễu nếu chưa làm.

### 02 — Khám phá / ngân hàng A–O

Các thẻ theo mạch: Hiểu mình (A/H/I), Sở thích và kỹ năng (B/C/N), Điều quan trọng và bối cảnh (D/F), Lựa chọn và thông tin (E/K/L), Kết nối (J), Hành động (G/O). Hiện số câu, thời lượng dự kiến theo pilot (không bịa số), mục đích và quyền bỏ qua. Có chế độ chọn từng phân hệ, tiếp tục câu dở dang, xem danh sách câu để sửa. M được tách khỏi danh sách cá nhân.

Màn hình câu hỏi: tên phân hệ, mã câu, tiến độ theo số mục, chỉ dẫn đúng thang, nội dung nguyên văn, các lựa chọn card/radio/check, nút Trước/Sau, Lưu và thoát. Cho bỏ trống hoặc X ngay; không tự chọn mặc định. Không chuyển câu bất ngờ khi chạm, không đánh giá màu sắc lựa chọn.

| Dạng | Widget và xử lý |
|---|---|
| A/B/C/D/G/H/L | Radio từng mức, nhãn rõ, U/X; thang hiển thị đầy đủ |
| E/K | Radio A–D + U/X; khóa đáp án ẩn cho tới kết thúc phiên đo; trang củng cố sau đo |
| F và M | Radio/checkbox theo `type`; loại trừ theo `exclusive_values`; thông báo nếu chọn kết hợp không hợp lệ |
| D | Màn hình bổ sung chọn tối đa 3 mã ưu tiên không trùng; kéo thả có phương án nút lên/xuống dễ tiếp cận; điều không muốn đánh đổi tự nguyện |
| I/O | Thẻ câu hỏi tự vấn, chọn giữ trên giấy hoặc không lưu; nếu có ghi chú cục bộ, khóa riêng và xóa được; chỉ lưu bản tóm tắt chia sẻ khi học sinh chủ động chọn; không đưa vào báo cáo mặc định |
| J | Hai lượt độc lập, chọn Y/N/U/X, ví dụ bắt buộc khi Y, xác nhận cùng bối cảnh và tự nguyện; không mời người khác qua mạng, không bình chọn công khai |
| N | Thẻ thử nghề: đề nguyên văn, vật liệu dễ tìm, vùng ghi sản phẩm hoặc mô tả minh chứng và mức hỗ trợ, rubric dành cho người đánh giá được giao quyền; học sinh không tự chấm thay nếu chưa có người đánh giá |

### 03 — Hồ sơ cá nhân

- Đầu trang: ngày, phiên bản, “Đây là ảnh chụp ở thời điểm hiện tại, không phải kết luận về con người em.” Hiện đủ/chưa đủ từng nhóm và số câu hợp lệ. Nhấn “Vì sao có kết quả này?” để xem mã và minh chứng.
- A: 3 nhóm, B: 6 thanh ngang kèm số và n/6 (radar tùy chọn khi đủ 6 nhóm; không nối điểm thiếu), C: 6 nhóm kỹ năng tự báo cáo, H: hai trục riêng. D: ba ưu tiên tự chọn. E/K: điểm kiến thức từng cụm, không hiện phần trăm nghề phù hợp. F: nhu cầu/nguồn lực do em chọn, G/L: số việc, J: các cặp đủ điều kiện, N: từng sản phẩm riêng. I/O: không hiện bản gốc, chỉ điều em đồng ý đưa vào. M không có trong báo cáo.
- Trình tự báo cáo: “Điều em đã mô tả”, “Minh chứng em đã có”, “Điều còn chưa rõ”, “Hướng thử tiếp theo”. Phân biệt câu tự báo cáo với minh chứng thật. Không tạo tổng điểm A–O, loại hình nhân cách, top học sinh.
- Phiếu xác nhận: “Phần nào đúng với em?”, “Phần nào em muốn sửa?”, “Có điều gì cần bổ sung?”, “Em muốn giữ riêng phần nào?”. Nút Đồng ý / Còn phân vân / Chỉnh lại / Không sử dụng gợi ý. Giữ phiên bản dự thảo riêng với bản đã xác nhận.

### 04 — Bản đồ lựa chọn (gợi ý mềm)

Một hướng nghề là một **giả thuyết cần khảo sát**, không phải phán quyết. Chỉ hiện 2–3 hướng khi có dữ liệu đủ; nếu thiếu, mời tự chọn hướng và trải nghiệm, không bịa nghề. Mỗi thẻ:

```
Hướng khảo sát: Khoa học môi trường (ví dụ giả định)
Vì sao: nhóm I; D10 được em ưu tiên [Xem mã]
Còn chưa rõ: chưa có sản phẩm phân tích dữ liệu
Việc thử: N01 hoặc một bài đọc dữ liệu trong 7 ngày
Điều kiện cần kiểm tra: lộ trình đào tạo, chi phí, cơ hội tiếp cận
[Muốn thử] [Còn phân vân] [Không phù hợp] [Em có hướng khác]
```

Không sinh số lương, học phí, trường tuyển sinh tự động. Tạo phiếu để em ghi hai nguồn độc lập có ngày và phạm vi. So sánh 2 hướng theo nhiệm vụ, giá trị, điều kiện, chi phí và hỗ trợ; không cộng điểm thành quyết định. Ba kịch bản: cơ sở, công nghệ thay đổi, nguồn lực thay đổi; em có quyền thêm hướng riêng.

### 05 — Kế hoạch 7–30–90 ngày

Mỗi mục là hành động do em chọn + minh chứng + hạn + nguồn hỗ trợ + cách điều chỉnh. Một việc có thể hoàn thành trong 5–15 phút cũng được. Giao diện timeline, trạng thái: dự thảo/đã chọn/đang làm/đã thử/cần điều chỉnh/bỏ qua. Không ép hoàn thành, không phạt lùi ngày, không tự động coi bỏ qua là thất bại. Không thông báo ngoài ứng dụng mặc định; nếu triển khai nhắc việc cục bộ, xin phép và cho tắt, không hiện thông tin nhạy cảm trên màn hình khóa.

### 06 — Em / không gian riêng

Quản lý hồ sơ cục bộ, đổi theme/cỡ chữ, đọc giới hạn sản phẩm, quyền riêng tư, xuất bản tóm tắt chọn lọc sau xem trước, xóa từng mục hoặc toàn bộ. Nhật ký mặc định tự giữ, không tự đồng bộ. Không lưu khóa API. Nếu dùng chung thiết bị: không hiển thị nội dung hồ sơ trên màn hình gần đây, tự khóa sau một thời gian không hoạt động, kiểm thử cách bảo vệ dữ liệu. Chỉ nói “đã mã hóa” sau khi thực hiện và kiểm thử thực tế.

### 07 — Em cần hỗ trợ (màn hình độc lập)

Header: “Có những lúc em cần một người thật lắng nghe.” Nội dung: ứng dụng không theo dõi nội dung em viết và không phải dịch vụ cấp cứu; nếu cảm thấy không an toàn, hãy tìm người lớn đáng tin cậy, cán bộ tư vấn hoặc nhân viên y tế phù hợp. Nếu có nguy hiểm tức thời, tìm nơi an toàn nếu có thể, nhờ người ở cạnh và gọi 115 (cấp cứu y tế) hoặc 113 (công an khi có đe dọa bạo lực); 111 là Tổng đài quốc gia bảo vệ trẻ em, có thể xin hướng dẫn phù hợp. Số và chức năng phải xác nhận lại theo địa bàn, độ tuổi và thời điểm trước phát hành. Hiển thị rõ nút mở trình gọi, không gọi tự động. Không gợi ý liên hệ người gây hại. Nếu học sinh tự báo đang không an toàn hoặc người phụ trách xác nhận vấn đề an toàn, tạm dừng gợi ý hướng nghiệp trong phiên, hiển thị trợ giúp và quyền thoát; không chẩn đoán, không tự động thông báo cho gia đình, không có cờ AI quét nhật ký. Không dùng công cụ báo cáo này thay đánh giá nguy cơ trực tiếp của chuyên gia.

## 3. Các ý tưởng tạo giá trị sống (đề xuất mới, không thêm mục vào thang đo)

### La bàn 14 — bảy hoạt động tự chọn

| Ngày | Nhiệm vụ | Sản phẩm tự nguyện | Liên kết |
|---|---|---|---|
| 1–2 | Hai việc em từng làm và ba điều quan trọng | Thẻ thế mạnh + giá trị | A/D/H |
| 3–4 | Hỏi một người em tin cậy về một hành vi cụ thể | Một ví dụ, không bình chọn tính cách | H/J |
| 5–6 | Thử một nhiệm vụ vừa sức | Một sản phẩm giấy và cảm nhận | B/C/N |
| 7–8 | Kiểm chứng lời quảng cáo hoặc lời khuyên AI giả định | Hai nguồn/kiểm tra và giới hạn | E/K/N06 |
| 9–10 | Tưởng tượng các lựa chọn và điều kiện thay đổi | Hai hướng, ba kịch bản | I14/D/F |
| 11–12 | Tìm một nguồn lực, so sánh chi phí | Phiếu N02 hoặc kế hoạch tiếp cận | F/L/N |
| 13–14 | Chọn việc sẽ làm tiếp | Kế hoạch 7–30–90 ngày | G/O |

Mỗi lần 5–10 phút tự vấn, thực hành tùy nhiệm vụ; có thể chia nhiều ngày, nghỉ hoặc đổi hoạt động. Không tính điểm A/B/C/H từ vài mục rút gọn; chỉ tính khi đủ theo quy tắc. Lịch 14 ngày là thiết kế cần thử nghiệm, không khẳng định hiệu quả. Kết thúc chương trình là một bản tóm tắt em có quyền sửa, không phải chứng chỉ tâm lý.

### Hộ chiếu minh chứng — “Những điều em đã thử”

Thẻ: tiêu đề, ngày, nhiệm vụ/mã N/C nếu liên quan, em đã làm gì, điều kiện và hỗ trợ, kết quả, điều học được, bước thử tiếp. Không yêu cầu ảnh khuôn mặt, giấy tờ, tên người khác. Ưu tiên mô tả văn bản hoặc sản phẩm giấy; nếu nhập ảnh sau này, loại metadata và xin phép, không tải lên mạng. Không suy diễn năng lực từ số thẻ.

### Một ngày sống có ý nghĩa

Từ A05/A08 và I/O: tự chọn câu hỏi “Hôm nay điều gì đáng nhớ với em?”; có thể là nghỉ ngơi, giúp bạn, hoàn thành việc nhỏ, học điều mới. Không đánh giá đạo đức, không ép tích cực, không lưu nếu em không muốn. Cho phép viết trên giấy. Không thêm thành chỉ số tâm lý.

### Tam giác thấu cảm

Bản phiếu tùy chọn dành cho trao đổi an toàn giữa học sinh, người chăm sóc và người tư vấn: điều em muốn, điều gia đình lo, thông tin/chi phí đã kiểm, bước thử cả ba đồng ý, ngày xem lại. Không tự chia sẻ kết quả, không mời gia đình nếu không an toàn; học sinh quyết định phần chia sẻ trong phạm vi pháp luật và bảo vệ học sinh. Đích là thống nhất một bước khám phá, không ép thống nhất nghề.

### Bản đồ phát triển theo thời gian

So sánh cùng chỉ báo, cùng phiên bản và điều kiện; hiển thị số câu hợp lệ và ghi chú trải nghiệm. Không cần điểm tăng mới là tiến bộ. Không so sánh giữa học sinh. Khi đổi phiên bản câu hỏi, không nối đồ thị nếu chưa chứng minh tương đương. Có thể dùng danh sách các sản phẩm đã thử thay biểu đồ khi thiếu dữ liệu.

### Phòng thử nghề chi phí thấp

Dùng nguyên N01–N08: đọc dữ liệu, ngân sách, quy trình kỹ thuật, thông điệp cộng đồng, giải thích, kiểm chứng AI, tổ chức dự án, thích ứng. Gợi ý bối cảnh địa phương Tây Nguyên (nông nghiệp, môi trường, dịch vụ, du lịch cộng đồng) dưới dạng nhiệm vụ luyện tập ngoài thang, không sửa đề gốc. Có bản giấy, hỗ trợ đọc, không yêu cầu thiết bị hoặc tài khoản.

## 4. Trạng thái UI và tiêu chí nghiệm thu

Mỗi màn hình phải xử lý được: dữ liệu chưa có, đang tải asset, lỗi dữ liệu, dữ liệu đủ/chưa đủ, lưu thất bại, khôi phục sau đóng app, bỏ qua, xóa, xác nhận hủy, màn hình chữ lớn, thiết bị nhỏ, chế độ máy bay. Không dùng nội dung minh họa làm dữ liệu thật. Báo cáo có ngày/phiên bản/n hợp lệ, thông tin nguồn, lựa chọn của học sinh; mọi nút phải thực hiện đúng hành động và kiểm thử được.

## 5. Định hướng store listing (bản nháp, chưa phát hành)

Tên: La bàn tương lai. Mô tả ngắn: “Khám phá bản thân, trải nghiệm nghề và xây dựng kế hoạch tương lai.” Mô tả dài: bộ công cụ giáo dục tự định hướng, không chẩn đoán tâm lý, không quyết định nghề thay học sinh, hỗ trợ ngoại tuyến nếu đã kiểm chứng. Ảnh store 5–6 màn hình với dữ liệu giả lập có nhãn, không có thông tin học sinh. Không quảng cáo “chuẩn quốc tế đã được kiểm định”, “tìm nghề chính xác 100%”, “AI chuyên gia tâm lý”.

Ưu tiên phát hành: core 206 mục + scoring + báo cáo + kế hoạch + hỗ trợ + quyền riêng tư trước; sau khi đạt kiểm thử mới bật La bàn 14, hộ chiếu, timeline; M/R/P và quản trị trường chỉ khi có quy trình nghiên cứu riêng. Chất lượng hơn số tính năng.
