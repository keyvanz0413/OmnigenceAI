# OmnigenceAI：文档智能分析与全交互表单实现方案

## 1. 业务流程概览
本方案旨在实现从原始 PDF 到可编辑 Web 表单，再到生成新 PDF 的完整业务闭环。

1. **上传 (Upload)**: 用户上传 PDF/图片（发票、货运单等）。
2. **提取 (OCR & Layout)**: 调用 **GCP Document AI** (`_parse_pdf_gcp_`) 获取结构化数据，包括文本内容及其精确的页面物理坐标（Bounding Boxes）。
3. **语义分析 (LLM Parsing)**: 利用 **LLM (GPT-4o/Claude)** 对 OCR 结果进行语义归类，识别“固定标签”与“动态待填字段”。
4. **视觉渲染 (Interactive Rendering)**: 
   - 前端将 PDF 转化为底图。
   - 根据坐标数据，在底图位置上方覆盖一层绝对定位的 HTML Input/Select 组件。
5. **用户交互 (FE Correction)**: 用户在网页上直接修改、补充或确认提取的信息。
6. **合规生成 (Serverless Generation)**: 
   - 调用 **AWS Lambda**，使用 `pdf-lib` 在原始 PDF 模板上按坐标覆盖新数据。
   - 存入 S3 并更新数据库记录。

---

## 2. 技术规格说明

### 2.1 后端解析层 (GCP + LLM)
- **OCR 核心**: 使用 Google Document AI 的 `DOCUMENT_OCR_PROCESSOR`。
  - **关键属性**: `normalizedVertices` (归一化坐标)，用于跨端适配。
- **相邻字符合并逻辑**:
  - 基于 Y 轴偏差值（Distance < Threshold）判定同级行。
  - 基于 X 轴间距判定词组。
- **LLM Mapping**:
  - 提示词设计：要求输出包含 `field_id`, `original_content`, `normalized_bbox`, `recommended_type` 的 JSON。

### 2.2 前端交互层 (React + Tailwind)
- **底层方案**: `pdfjs-dist` 或 `react-pdf` 渲染 Canvas/PNG 背景。
- **坐标映射算法**:
  ```typescript
  const screenX = normalizedX * containerWidth;
  const screenY = normalizedY * containerHeight;
  ```
- **交互组件**: 
  - 设置 Input 样式为 `appearance-none bg-transparent border-dashed hover:border-blue-400 focus:bg-white`。
  - 实现“原位编辑”的视觉错觉。

### 2.3 Serverless 生成层 (AWS Lambda)
- **环境**: Node.js 20.x。
- **核心库**: `pdf-lib`。
- **优势**: 
  - 支持增量更新 PDF（Incremental Update），不破坏原始文档元数据。
  - 极速启动（Cold Start 优化），适合按需生成的场景。

---

## 3. 数据协议定义 (Example JSON)

```json
{
  "taskId": "uuid-12345",
  "document": {
    "pages": [
      {
        "pageIndex": 0,
        "bgImage": "s3://path/to/page_0.png",
        "fields": [
          {
            "id": "customer_name",
            "label": "客户姓名",
            "value": "张三",
            "bbox": [0.12, 0.45, 0.25, 0.48], // [left, top, right, bottom]
            "type": "text"
          }
        ]
      }
    ]
  }
}
```

---

## 4. 开发路标 (Roadmap)

### 第一阶段：基础管道 (Weeks 1-2)
- [ ] 后端：实现 GCP Document AI 调用脚本，输出归一化坐标。
- [ ] 前端：实现基于图片展示的“静态方框”渲染，验证坐标对齐准确度。

### 第二阶段：智能表单 (Weeks 3-4)
- [ ] LLM：接入分析逻辑，自动归类 Key-Value。
- [ ] 前端：开发 `PdfOverlayEditor` 组件，支持受控 Input 编辑。

### 第三阶段：闭环交付 (Weeks 5-6)
- [ ] AWS：部署 Lambda 函数，实现 `pdf-lib` 文本覆盖生成逻辑。
- [ ] 存储：打通 S3 上传与数据库持久化流水线。

---

## 5. 风险与对策
- **字体对齐**: PDF 常用字体不一。*对策：在 Lambda 中预置主流中文字体，匹配 OCR 返回的高度计算 FontSize。*
- **错位风险**: 滚动或缩放导致 Input 偏移。*对策：使用容器级 `ResizeObserver` 动态计算 scale 系数。*
