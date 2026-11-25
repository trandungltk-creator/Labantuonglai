# PROMPT CHỦ ĐẠO — Xây dựng La bàn tương lai trên Flutter

Dán tài liệu này vào Google AI Studio với vai trò **yêu cầu dành cho AI lập trình của nhà phát triển**, không phải System Instructions của chatbot chạy trong ứng dụng. Đính kèm mã nguồn hiện tại, hai JSON chuẩn và các file Markdown đi kèm. Chỉ gửi tài liệu thiết kế và dữ liệu giả lập, không gửi hồ sơ học sinh thật.

## A. Nhiệm vụ bắt buộc

Bạn là kỹ sư Flutter/Android có trách nhiệm với chất lượng phần mềm giáo dục. Hãy sửa dự án Flutter hiện có, không tự thay đổi chuyên môn, không tạo app chỉ có mockup. Xây dựng ứng dụng tiếng Việt dành cho THPT, ngoại tuyến, rule-based, nhân văn, có thể kiểm thử và chuẩn bị Android App Bundle. Phân biệt bản nguyên mẫu kỹ thuật với bản phát hành đã được phê duyệt. Không thay đổi mã câu hỏi, câu chữ, phương án, khóa, nhóm, rubric hoặc thang đo để làm đẹp giao diện.

### Nguồn sự thật và thứ tự ưu tiên

1. `questions_database_chuan_2.0.1.json` (phiếu 2.0, quy tắc 2.0.1) — dùng trực tiếp làm asset bất biến, không tái sinh bằng AI; `01_Ngan_hang_206_muc_CHUAN.md` để đọc và kiểm tra thủ công.
2. Tài liệu 03 này — quy tắc nghiệp vụ và cổng kiểm thử; nguồn quy chuẩn Word 2.0.1 nếu đính kèm.
3. `feedback_library_2.0.1.json` và `04_Thu_vien_phan_hoi_206_muc.md` — gợi ý phản hồi tương ứng mã; không phải kết luận lâm sàng. Chỉ hiển thị nhánh đúng và có căn cứ; U/X/trống xử lý riêng. Không đọc/quét I/O tự động.
4. `02_Thiet_ke_UI_UX_va_y_tuong_nhan_van.md` — UI và tính năng đề xuất, không có quyền ghi đè ngân hàng.
5. ZIP Flutter cũ chỉ là mã tham khảo. Bỏ JSON cũ và System Instructions cũ. Khi gặp xung đột, báo rõ, không tự suy đoán hoặc âm thầm sửa nguồn. Giữ lịch sử câu trả lời gắn phiên bản; không chuyển dữ liệu trả lời ngân hàng cũ bị sửa nội dung sang mã mới theo tên mã đơn thuần.

## B. Kiến trúc và bảo mật

- Chỉ dùng AI Studio lúc phát triển. App học sinh không gọi Gemini API, LLM, chatbot AI, proxy AI hay dịch vụ phân tích văn bản. Xóa `gemini_service.dart` hoặc thay bằng dịch vụ cục bộ, bỏ dependency AI, API Key và màn hình nhập Key, mọi kết nối cloud/telemetry không cần thiết. Không lách điều khoản bằng tuổi khai sai. Điều khoản Gemini có giới hạn ứng dụng hướng tới người dưới 18 tuổi (nguồn cuối file).
- Không yêu cầu tài khoản, tên, ngày sinh chính xác, số điện thoại, vị trí, danh bạ, camera/micro hay quyền tệp rộng. Chỉ mã ngẫu nhiên, khối tự nguyện, phiên bản và ngày khi cần. Không quảng cáo, không theo dõi người dùng. Xem xét bỏ quyền INTERNET ở manifest bản release nếu toàn bộ app offline, kiểm tra manifest hợp nhất và các SDK; mở tài liệu trợ giúp chính thức ngoài app theo thao tác chủ động nếu cần.
- Kiến trúc gợi ý: `lib/domain/{question,answer,scoring,feedback,report,plan,support}.dart`; `lib/data/{asset_repository,local_repository,privacy_repository}.dart`; `lib/features/{onboarding,home,survey,report,plan,private_space,support}/`; `assets/data/`; `test/`; `integration_test/`. Logic thuần Dart không phụ thuộc Widget, có test đơn vị. Có thể dùng thư viện ổn định đã kiểm tra giấy phép và tương thích SDK; không tự tuyên bố package chưa xác minh là an toàn.
- Lưu câu trả lời cục bộ chỉ sau giải thích rõ; mã hóa at-rest bằng giải pháp đã được kiểm thử (khóa lưu Android Keystore qua thư viện phù hợp, không hardcode; không tự chế thuật toán mã hóa). Xem xét loại trừ backup Android và kiểm tra restore; không log dữ liệu cá nhân; nếu không thực hiện mã hóa, không cho phép hồ sơ thật. Xóa toàn bộ hồ sơ và bản sao nội bộ; giải thích bản xuất do người dùng quản lý. Không khẳng định xóa được bản đã chia sẻ ngoài app. Xuất bản tóm tắt có xem trước và bỏ chọn trường; không tự xuất nhật ký hoặc dữ liệu nhạy cảm.
- Tách I/O khỏi hồ sơ chia sẻ; mặc định giữ trên giấy/không lưu. Chỉ lưu tóm tắt có hành động đồng ý riêng; rút đồng ý phải xóa tóm tắt. J chỉ khi hai người tự nguyện cùng bối cảnh. M tách luồng và kho dữ liệu, không dùng profileId, không gắn với I/O/F hay nhật ký; MVP tắt M thu thập nếu chưa phê duyệt nghiên cứu. T01–T12 không phải chẩn đoán. Hồ sơ yêu cầu trợ giúp không trộn vào báo cáo nghề; MVP chỉ cung cấp thông tin kết nối người thật, không tự nhận đã gửi yêu cầu nếu chưa có dịch vụ được xác nhận.
- Thông báo quyền riêng tư dễ hiểu, không hứa bảo mật tuyệt đối; kiểm tra quy định Việt Nam (Thông tư 18/2025/TT-BGDĐT, Luật 91/2025/QH15, NĐ 356/2025/NĐ-CP) và quy trình đồng thuận, bảo vệ học sinh, quyền xóa, thời hạn lưu do trường phê duyệt. Không coi tài liệu này là ý kiến pháp lý hoặc chứng nhận tuân thủ.

## C. Hợp đồng dữ liệu (schema chính xác)

Asset gốc chứa `schema_version`, `question_version`, `rule_version`, `total_items`, `modules`, `questions`. Mỗi question: `id`, `module`, `subgroup` (nullable), `content`, `type`, `options: [{value,label}]`, `exclusive_values: []`, `answer_key` (nullable), `rubric` (nullable). Mọi option value đều là **chuỗi**, kể cả `"0"`–`"5"`; dữ liệu chưa nhập = null/không có key. Không dùng lẫn int, bool, chuỗi rỗng, `key/text` cũ; validate trước khi parse. Không lộ answer_key hoặc rubric nội bộ E/K trong chế độ đo. JSON kèm theo có khóa để chấm nội bộ, không phải cơ chế bảo mật đề thi.

Các kiểu `scale`, `single_choice`, `multi_choice`, `paired_observation`, `practice_rubric`, `private_reflection`. Mô hình câu trả lời phân biệt:

```json
{
  "questionVersion": "2.0",
  "ruleVersion": "2.0.1",
  "profileId": "demo-random-01",
  "grade": "11",
  "answers": {
    "A01": "3",
    "C01": "0",
    "E01": "U",
    "F02": ["A", "B"],
    "J01": {"self":"Y", "selfExample":"Ví dụ giả định", "observer":"N", "observerExample":null, "sameContext":true, "mutualConsent":true},
    "N01": {"score":"1", "evidence":"Sản phẩm giả định", "support":"Có hướng dẫn", "reviewerConfirmed":true},
    "I01": {"shareConsent":false, "sharedSummary":null}
  },
  "valuePriorities": ["D02", "D07"],
  "boundary": null,
  "confirmedSafetyPause": false
}
```

Đây là mẫu giả lập của hợp đồng ứng dụng, không thêm vào asset. Multi-choice U/X lưu dạng mảng một phần tử; các phương án loại trừ không đi cùng lựa chọn khác. Array rỗng = chưa nhập. Không tự ép kiểu để hợp lệ hóa dữ liệu sai. M có repository độc lập, không sử dụng hợp đồng hồ sơ này. J nhận U/X/trống nhưng không phân loại 4 ô; N không tự chấm từ văn bản; I/O không tự lưu nội dung nếu chưa đồng ý. `confirmedSafetyPause` là hành động người dùng/người phụ trách xác nhận, không phải cờ suy diễn tâm lý.

## D. Bộ máy tính điểm 2.0.1 — bắt buộc

| Mục | Tính toán |
|---|---|
| A | NT A01–04, YN A05–08, TC A09–12. Ít nhất 3/4 hợp lệ mỗi nhóm. 100 × (TB−1)/4. Không tổng. |
| B | R B01/12/17/22/27/32; I B02/07/18/23/28/33; A B03/08/13/24/29/34; S B04/09/14/19/30/35; E B05/10/15/20/25/36; C B06/11/16/21/26/31. 5/6 mỗi nhóm, 100 × (TB−1)/4. Chỉ xác định nhóm dẫn đầu khi đủ cả 6. max−min ≤10: hồ sơ phẳng, không ép mã; khác thì các nhóm cách max ≤10 là dẫn đầu. Tính trên điểm chưa làm tròn. Đây là quy ước phản hồi nội bộ. |
| C | TT C01/07/13/19; TH C02/08/14/20; ST C03/09/15/21; GT C04/10/16/22; TC C05/11/17/23; SO C06/12/18/24. ≥3/4 mỗi nhóm. 100 × TB/4. Chỉ tự báo cáo, không phải năng lực đã xác minh. |
| D | 0–4; giữ từng giá trị và tối đa 3 ưu tiên học sinh tự chọn, có thể thiếu; không tổng, không tự chọn hộ. |
| E | Nhóm theo JSON. Đúng 1; sai hoặc U 0; X/trống thiếu; chỉ báo /3 nếu đủ 3, tổng /12 nếu đủ 12. 0–1 củng cố lại; 2 củng cố; 3 vận dụng; không đo IQ. |
| F | F01 đơn; F02–08 nhiều. U/X đứng riêng; F02D/F04D/F05D/F08D đứng riêng. F03D có thể đi cùng các phương án khác. Không chấm, không loại nghề theo hoàn cảnh. |
| G | Đếm riêng 2, 0–1 và U/X/trống, tổng số mục 8; giữ từng mã trạng thái riêng. Không tính phẩm chất. |
| H | NT H01–08, NB H09–16, ≥6/8 từng trục; 100 × (TB−1)/4. Không tổng, không ngưỡng cao/thấp, không archetype. |
| I | 4–6 câu tự chọn, không chấm/phân tích tự động. |
| J | Cùng bối cảnh và có đồng thuận; Y cần ví dụ cụ thể mỗi bên. Chỉ phân Y/Y, Y/N, N/Y, N/N khi đủ dữ liệu. N chỉ nghĩa chưa thấy dù có cơ hội. Không tính tỷ lệ vùng mù/điểm. |
| K | Nhóm theo JSON; quy tắc E nhưng chỉ báo 4 cụm /3 khi đủ, **không tạo tổng K**. |
| L | KT L01–04, TN L05–08, SN L09–12; đếm riêng 0/1/2/U/X/trống từng nhóm. Mỗi nhóm tổng số đếm 4. Không cộng thành điểm năng lực. |
| M | Đơn M01–04,07,09,11,12; nhiều M05,06,08,10. U/X đứng riêng và M05F/M06E/M08G/M10G đứng riêng. Chỉ báo nhóm nghiên cứu, mẫu số hợp lệ từng câu; tỷ lệ nhiều lựa chọn có thể cộng >100%. Tách U/X/trống. Quy tắc thử kỹ thuật 2.0.1 ẩn nhóm/ô nhỏ dưới 10, không bảo đảm ẩn danh tuyệt đối, phải được duyệt lại. |
| N | Điểm 0/1/2 riêng mỗi bài, chỉ khi có sản phẩm minh chứng và người có nhiệm vụ xác nhận rubric; 0 là có sản phẩm chưa đạt. U/X/trống chưa đánh giá. Ghi mức hỗ trợ, không tổng. |
| O | 1–3 câu tự chọn/lần; không chấm, không phân tích cảm xúc, không streak. |

A/B/C/H chỉ nhận chuỗi số trong miền đúng; U/X/trống không tính. Điểm hiển thị một số lẻ và n/tổng; nếu thiếu, hiển thị `Chưa đủ dữ liệu`, không vẽ 0 hoặc đường nối thiếu. A dưới 40, từ 40 đến dưới 75, từ 75 trở lên nếu dùng chỉ là quy ước gợi ý đối thoại trong nguồn, không phải chuẩn tâm lý; không gán nhãn hoặc gợi ý sức khỏe. Không tự đặt ngưỡng H. Toàn bộ R/P ngoài A–O: R1–R4 đo kết quả giáo dục độc lập 0–2; R_total 0–8 chỉ khi đủ bốn; hai dạng RA/RB cần kiểm định tương đương; P phản hồi khả dụng, không chẩn đoán. Không trộn vào hồ sơ cá nhân hoặc tự tạo bài đo R thay nguồn.

## E. Bộ máy phản hồi và gợi ý mềm

Đọc thư viện phản hồi theo mã và lựa chọn. E/K có phản hồi đúng/sai sau phiên đo; với X/trống không truy xuất nhánh 0; U ở E/K củng cố kiến thức; ở phần khác hỏi cơ hội/chưa rõ tùy câu. I/O chỉ đưa bản tóm tắt được chủ động chia sẻ vào cuộc đối thoại với người thật, không tự động phân tích. N chỉ dùng rubric đã được xác nhận. J hiển thị khác biệt quan sát, không kết luận người nào đúng. Phản hồi cần: dữ liệu, điều chưa rõ, câu hỏi xác minh tự nguyện, việc thử, minh chứng. Dữ liệu tự báo cáo ghi rõ “em tự mô tả”; không gọi là năng lực thực chứng.

Ma trận 12 nhu cầu hỗ trợ (nguồn quy chuẩn 2.0.1). Không tự gán T cho học sinh khi điều kiện cần xác minh chưa được xác nhận; chỉ đề xuất câu hỏi, ghi nhận sau đối thoại:

| Mã | Điều kiện cần xác minh | Hỗ trợ |
|---|---|---|
| T01 | B dẫn đầu; C liên quan thấp hoặc thiếu/U | Hỏi cơ hội, thử N; không kết luận thiếu năng khiếu |
| T02 | C tự báo cáo khá rõ; B liên quan ít thích | Hỏi nhiệm vụ thích, D và trải nghiệm khác |
| T03 | B đủ sáu nhóm và max−min ≤10 | Thử hai hoạt động khác; phân biệt toàn thấp/toàn cao; thiếu nhóm không T03 |
| T04 | A thấp theo quy ước hoặc H có mục em muốn làm rõ | Hỏi ví dụ và phản hồi nếu đồng ý; không kết luận tự ti |
| T05 | J đủ điều kiện, Y/N hoặc N/Y | Đối thoại riêng, kiểm chứng ví dụ |
| T06 | D03 ưu tiên và học sinh xác nhận khó khăn chi phí | N02, tìm nguồn hỗ trợ; F03 riêng không đồng nghĩa nghèo |
| T07 | E/K cụm đủ 0–1/3 hoặc L có U hoặc F02D | Củng cố thông tin, tạo cơ hội; không suy IQ |
| T08 | G có 0/1 và em xác nhận muốn tiến hành | Một việc, sản phẩm, ngày hẹn |
| T09 | C tự báo cáo rõ; N liên quan có sản phẩm 0/1 | Hỏi điều kiện, thử biến thể; không kết luận ngộ nhận |
| T10 | Em tự nguyện chia sẻ khó khăn kéo dài hoặc yêu cầu hỗ trợ | Mời gặp riêng, xem an toàn; không quét I/O |
| T11 | F05D hoặc F07B | F05D chưa biết đầu mối; F07B muốn trao đổi riêng, không tự liên hệ |
| T12 | H04 chưa rõ/thấp và em xác nhận lịch quá tải | Điều chỉnh cùng em; G05 chỉ là bối cảnh mục tiêu, không đo quá tải |

Gợi ý nghề: sử dụng mapping hoạt động minh họa có thể kiểm tra và hiển thị căn cứ mã B/C/D/F/N, không xếp loại người, không dự báo mức phù hợp, không sinh ngành từ dữ liệu thiếu. Các hướng đề xuất: R thực hành/kỹ thuật/nông nghiệp ứng dụng, I nghiên cứu/phân tích/khoa học, A sáng tạo/thiết kế/truyền thông, S giáo dục/dịch vụ hỗ trợ, E tổ chức/khởi xướng/kinh doanh, C dữ liệu/quy trình/nghiệp vụ. Đây là ví dụ nhiệm vụ nghề, không phải danh sách nghề độc quyền. Không mặc định rào cản F là điều kiện loại trừ. D là ưu tiên do em chọn; không áp thứ tự mặc định. Luôn có hướng tự chọn hoặc không chọn. Gợi ý phải kèm điều cần thử và nguồn để xác minh thông tin hiện tại. Không dùng tỷ lệ “phù hợp”, “khả năng thành công”, “chẩn đoán”, “hội chứng”, “archetype”, “điểm mù”.

Định dạng báo cáo nội bộ đề xuất: `reportVersion`, `questionVersion`, `ruleVersion`, `generatedAt`, `dataCompleteness`, `groupResults` (nullable score + validCount), `selfReportedStrengths`, `confirmedEvidence`, `questionsToExplore` (sourceIds + câu hỏi + trạng thái xác nhận), `softSuggestions` (sourceIds, reason, unknowns, microExperiment, studentChoice), `actionPlan` (danh sách object horizonDays 7/30/90, task, evidence, dueDate, support, adjustment, status), `studentReview`, `safetyPause`. Có schema test round-trip; không dùng tên trường cũ sai kiểu `micro_action_plan_7_30_90`. Khi đổi câu trả lời, đánh dấu báo cáo cũ, không ghi đè kế hoạch đã xác nhận; mời tạo phiên bản dự thảo mới. Khi `safetyPause=true` thì không tạo/hiển thị báo cáo hướng nghiệp thông thường cho phiên, chuyển màn hình trợ giúp; giữ quyền truy cập thông tin hỗ trợ và thoát. Không giả vờ phát hiện nguy cơ hoặc đã liên hệ hỗ trợ.

## F. Kiểm thử bắt buộc trước khi tuyên bố hoàn thành

Chuyển các ca thành `flutter test` thực tế, không chỉ ghi checklist. Kiểm tra asset checksum/version trong CI; khóa dữ liệu và chặn thay đổi không duyệt. Kiểm tra test coverage luồng nghiệp vụ, thiết bị thật và chế độ offline; báo số ca thực chạy và kết quả.

| ID | Input / tình huống | Kỳ vọng |
|---|---|---|
| D01 | Load JSON | 206 mã duy nhất, số lượng A–O = 12,36,24,10,12,8,8,16,16,12,12,12,12,8,8 |
| D02 | So khớp nguồn | 206 nội dung, 185 phương án thực chất, 24 khóa/cụm, 8 rubric N; không thay text |
| D03 | Option tất cả câu | `value` chuỗi và `label` không rỗng, giá trị duy nhất; khóa E/K nằm trong options |
| D04 | A02/A03/A04/A12 | Khớp nguyên văn file 01, không dùng ngân hàng cũ |
| S01 | A01–04 toàn 1 rồi toàn 5 | NT 0 rồi 100, không tổng A |
| S02 | A01–04 = 1,3,5,U | NT 50, n=3 |
| S03 | A01–04 = 1,5,X,null | NT chưa đủ, n=2 |
| S04 | A nhận 0,6,true hoặc số 3 thay chuỗi | Từ chối ngoài hợp đồng |
| S05 | B toàn 3 | 6 nhóm 50, hồ sơ phẳng, không mã dẫn đầu bắt buộc |
| S06 | B nhóm R 4/6 hợp lệ, nhóm khác đủ | Không xếp Holland |
| S07 | B R và I cùng 100, nhóm khác 0 | R và I đồng dẫn đầu |
| S08 | So sánh max−min = 10 và >10 | Đúng điều kiện biên, không làm tròn trước so sánh |
| S09 | C01,C07,C13,C19 = 0,2,4,U | TT=50 n=3; 0 là hợp lệ |
| S10 | H01–08 toàn 5; H09–16 toàn 1 | 100 và 0, không tổng/nhãn |
| S11 | H một trục 5/8 | Chưa đủ |
| S12 | E đúng hết | 4 nhóm 3/3, tổng 12/12 |
| S13 | K đúng hết | 4 cụm 3/3, không có tổng K |
| S14 | E01,E05,E09 = B,U,X | NG n=2, không báo /3 |
| S15 | K01,K06,K09 = U,U,U | DL 0/3, n=3 |
| S16 | D ưu tiên D02,D07; đổi điểm D03 lên 4 | Không tự thay danh sách ưu tiên |
| S17 | F02 = [A,D] | Từ chối kết hợp, hướng dẫn rõ |
| S18 | F03 = [A,D] | Hợp lệ |
| S19 | M05 = [B,F] hoặc M08=[A,U] | Từ chối |
| S20 | G/L chứa 0,1,2,U,X,trống | Đếm đúng riêng, không đổi U thành 0 |
| S21 | J Y/N, ví dụ Y, cùng bối cảnh và đồng thuận | Y/N hợp lệ |
| S22 | J Y thiếu ví dụ hoặc khác bối cảnh/không đồng thuận | Chưa đủ, không kết luận |
| S23 | N score 0, có sản phẩm và người đánh giá xác nhận | 0 hợp lệ |
| S24 | N score 0 thiếu sản phẩm hoặc chưa xác nhận | Chưa đánh giá |
| S25 | I/O không chọn chia sẻ hoặc rút đồng ý | Không lưu/loại bản tóm tắt khỏi báo cáo |
| S26 | X ở câu bất kỳ | Không phán xét, không tự gán việc dựa trên X |
| S27 | Hồ sơ trống | Không tự sinh mã, điểm hoặc nghề; mời khám phá tự chọn |
| S28 | F05D vs F07B | Chưa biết đầu mối vs muốn trao đổi riêng, phản hồi khác nhau |
| S29 | F03A | Không gán khó khăn kinh tế |
| S30 | G05 thấp nhưng chưa xác nhận quá tải | Không T12 |
| S31 | Báo cáo JSON round-trip | 7/30/90 đúng kiểu, thiếu giữ null |
| S32 | Safety pause xác nhận | Ngừng báo cáo thường, mở trợ giúp, không tự gọi/gửi |
| P01 | Khởi động lần đầu, airplane mode | Onboarding, 206 câu, chấm, báo cáo hoạt động không mạng |
| P02 | Đóng app giữa khảo sát rồi mở lại | Khôi phục đúng câu và đáp án; không đổi phiên bản |
| P03 | Xóa hồ sơ, khởi động lại | Không còn dữ liệu đã xóa; không tự phục hồi từ backup |
| P04 | Rà soát dependency, manifest, traffic | Không API Key/Gemini/telemetry hoặc gửi hồ sơ ra ngoài |
| P05 | M tắt hoặc nghiên cứu riêng | Không lộ vào hồ sơ, không liên kết mã, ẩn nhóm nhỏ |
| P06 | Xuất bản tóm tắt | Preview, chọn trường; mặc định loại I/O và yêu cầu hỗ trợ |
| U01 | Tất cả type khảo sát | Radio, multi, D ưu tiên, J cặp, N rubric, I/O đúng chức năng |
| U02 | Chữ 200%, màn nhỏ, TalkBack, dark mode | Không tràn chữ; có nhãn accessible; biểu đồ có bảng |
| U03 | X hoặc thoát trước khi hoàn tất | Không khóa app/ép trả lời; lưu tiến độ đúng |
| U04 | Ứng dụng báo cáo mới/cũ sau sửa đáp án | Không ghi đè bản đã xác nhận, tạo dự thảo mới |
| U05 | Demo có dữ liệu giả định | Nhãn DEMO rõ, không dùng dữ liệu thật |

## G. Triển khai theo từng lần yêu cầu (không viết lại tất cả một lượt)

1. **Audit + data:** liệt kê file cũ, lỗi schema, dependencies, phiên bản; lập kế hoạch, thay asset chuẩn, model parser, validate 206 mục và test D01–D04. Không sửa dữ liệu. Nếu dự án thiếu android/, tạo scaffold Flutter đúng cách bằng SDK cài đặt; giữ package identifier do nhà phát triển xác nhận, không dùng package ví dụ khi phát hành.
2. **Domain:** tạo scoring, feedback, report, action plan và các test S; bỏ Gemini/runtime API. Làm cho test chạy và báo kết quả thật. Nếu không có môi trường chạy, đánh dấu NOT RUN, cung cấp lệnh để kiểm tra cục bộ.
3. **UI + persistence:** tạo màn hình theo 02, đúng kiểu dữ liệu, lưu cục bộ bảo vệ, trợ giúp, consent/xóa, report, thử offline. Chỉ hiển thị tính năng đã hoạt động; không gắn nút giả. Hoàn thiện các test P/U.
4. **Giá trị bổ sung:** La bàn 14, hộ chiếu minh chứng, phản biện báo cáo, timeline, Tam giác thấu cảm có điều kiện. Bật sau khi core đạt. Giữ M/R/P riêng, không đưa khảo sát nghiên cứu vào public MVP khi chưa có phê duyệt.
5. **Release candidate:** chạy format/analyze/test, integration test thiết bị thật, xem manifest, mạng, backup, quyền riêng tư, accessibility; `flutter build appbundle --release` trên môi trường Flutter/Android đúng phiên bản. Kiểm tra AAB, ký bằng khóa nhà phát triển do họ quản lý, không đưa khóa lên AI Studio/Git. Chưa được gọi là sẵn sàng phát hành nếu không có log build và test, kiểm toán phù hợp và thẩm định giáo dục.

Sau mỗi bước xuất: danh sách tệp thay đổi, diff/giải thích, cách chạy, test PASS/FAIL/NOT RUN, vấn đề còn mở. Không tuyên bố đã biên dịch, kiểm thử, mã hóa hoặc đáp ứng Play nếu chưa có minh chứng. Yêu cầu nhà phát triển kiểm tra ở từng gate trước khi sang bước tiếp theo.

## H. Cổng phát hành CH Play (tham chiếu chính thức kiểm tra 25/11/2026)

- Android App Bundle, Play App Signing, target Android 16 / API 36 trở lên cho app điện thoại mới theo yêu cầu hiện hành; rà lại trước nộp: https://support.google.com/googleplay/android-developer/answer/11926878
- Chính sách dữ liệu người dùng: https://support.google.com/googleplay/android-developer/answer/10144311 ; khai báo Data Safety theo hành vi thực tế, không khai “không thu thập” nếu SDK hay luồng export/network khiến khai báo không đúng. Chính sách riêng tư công khai và trong app, thông tin nhà phát triển/liên hệ thật, mục đích, lưu/xóa, chia sẻ.
- Target audience khai đúng 15–18, không giả là người lớn; rà Families policy nếu áp dụng theo nhóm tuổi, thị trường và tính năng: https://support.google.com/googleplay/android-developer/answer/9867159 ; https://support.google.com/googleplay/android-developer/answer/9893335
- Hoàn thành biểu mẫu Health apps declaration; xác định đúng phạm vi giáo dục/sức khỏe, không quảng cáo chữa trị/chẩn đoán. https://support.google.com/googleplay/android-developer/answer/13996367 ; https://support.google.com/googleplay/android-developer/answer/18265346
- Tài khoản cá nhân tạo sau 13/11/2023: yêu cầu closed test tối thiểu 12 tester opt-in liên tục 14 ngày trước khi xin production access. Kiểm tra trên Play Console của tài khoản cụ thể. Chỉ dùng hồ sơ giả lập trong test kỹ thuật cho tới khi có phê duyệt sử dụng thật. https://support.google.com/googleplay/android-developer/answer/14151465
- Gemini API Additional Terms, hiệu lực 23/03/2026: giới hạn dịch vụ đối với ứng dụng hướng tới/có thể được người dưới 18 tuổi truy cập; vì thế loại bỏ API runtime của app học sinh, không gửi dữ liệu nhạy cảm vào AI Studio. https://ai.google.dev/gemini-api/terms
- Rà các luật/điều khoản và quy trình trường tại thời điểm phát hành. Thẩm định độc lập, thử nghiệm sư phạm, bảo mật và quyền riêng tư là cổng riêng; không coi Google duyệt app là xác nhận khoa học hoặc pháp lý.

## I. Lệnh bắt đầu (copy vào ô chat của AI Studio)

> Hãy đọc tất cả tệp đính kèm và thực hiện **Giai đoạn 1** của tài liệu `03_Chi_dan_lap_trinh_va_kiem_thu.md`. Dùng nguyên `questions_database_chuan_2.0.1.json` và `feedback_library_2.0.1.json` làm asset bất biến. Không sử dụng JSON cũ, không viết lại câu hỏi, không tích hợp Gemini API runtime. Trước tiên hãy kiểm tra ZIP Flutter hiện tại, lập danh sách lỗi và sửa parser + asset, bổ sung kiểm thử D01–D04. Trả lại toàn bộ tệp mã nguồn cần sửa hoặc patch cụ thể, cách chạy, kết quả test thật nếu có môi trường; nếu không có hãy ghi NOT RUN. Đừng làm giai đoạn sau cho tới khi hoàn thành gate này.

Sau khi xác nhận D01–D04, lần lượt yêu cầu “Thực hiện Giai đoạn 2/3/4/5 theo tài liệu 03, giữ nguyên nguồn dữ liệu, không bỏ các test trước”. Không để AI Studio tự tuyên bố hoàn tất mà không kiểm tra.
