export interface ListeningExercise {
  id: string;
  title: string;
  titleChinese: string;
  scenario: "handoff" | "doctor-orders" | "patient-symptoms" | "phone-call" | "announcement";
  difficulty: "basic" | "intermediate" | "advanced";
  transcript: string;
  transcriptChinese: string;
  questions: {
    question: string;
    questionChinese: string;
    options: string[];
    correctIndex: number;
  }[];
}

export const listeningExercises: ListeningExercise[] = [
  {
    id: "le1", title: "Nurse Handoff: Post-Op Patient", titleChinese: "护士交班：术后患者",
    scenario: "handoff", difficulty: "intermediate",
    transcript: "Hi, I'm handing off Mr. Johnson in room 302. He's a 65-year-old male, post-op day one from a right hip replacement. Vital signs are stable: BP 128/78, heart rate 72, temp 37.2. He's on a PCA pump for pain management. His last pain score was 4 out of 10. He's been ambulating with PT twice today. Diet is regular. He has an IV of normal saline running at 75 mL per hour. Foley catheter is in place, output has been adequate. His surgeon wants him up walking three times tomorrow.",
    transcriptChinese: "你好，我要交班302房间的Johnson先生。他是65岁男性，右髋关节置换术后第一天。生命体征稳定：血压128/78，心率72，体温37.2。他正在使用PCA泵进行疼痛管理。他最后的疼痛评分是4/10分。他今天和物理治疗师下床活动了两次。饮食正常。正在输注生理盐水，75毫升/小时。留置导尿管，尿量足够。他的外科医生要求明天下床活动三次。",
    questions: [
      { question: "What surgery did Mr. Johnson have?", questionChinese: "Johnson先生做了什么手术？", options: ["Left knee replacement", "Right hip replacement", "Left hip replacement", "Right knee replacement"], correctIndex: 1 },
      { question: "What is his current pain score?", questionChinese: "他目前的疼痛评分是多少？", options: ["2/10", "4/10", "6/10", "8/10"], correctIndex: 1 },
      { question: "How many times should he walk tomorrow?", questionChinese: "明天他应该走几次？", options: ["Once", "Twice", "Three times", "Four times"], correctIndex: 2 },
    ]
  },
  {
    id: "le2", title: "Doctor's Orders: New Admission", titleChinese: "医嘱：新入院",
    scenario: "doctor-orders", difficulty: "intermediate",
    transcript: "This is Dr. Chen. I'm admitting Mrs. Wang to the medical floor with a diagnosis of community-acquired pneumonia. I want her on ceftriaxone 1 gram IV every 24 hours and azithromycin 500 mg IV daily. Start oxygen at 2 liters per minute via nasal cannula. Keep her SpO2 above 92%. I want a chest X-ray in the morning, CBC, BMP, and blood cultures times two before starting antibiotics. She can have a regular diet. Activity as tolerated. IV fluids: normal saline at 100 mL per hour. Call me if her temperature goes above 39 degrees or if her oxygen drops below 90%.",
    transcriptChinese: "我是陈医生。我要将王女士收入内科病房，诊断为社区获得性肺炎。我要给她头孢曲松1克静脉注射每24小时一次，阿奇霉素500毫克每日静脉注射。经鼻导管给氧2升/分钟。保持血氧饱和度在92%以上。早上拍胸片，做全血细胞计数、基础代谢组合，使用抗生素前做两次血培养。可以正常饮食。活动根据耐受情况。静脉液体：生理盐水100毫升/小时。如果体温超过39度或血氧低于90%请通知我。",
    questions: [
      { question: "What is the diagnosis?", questionChinese: "诊断是什么？", options: ["Bronchitis", "Community-acquired pneumonia", "Tuberculosis", "Asthma exacerbation"], correctIndex: 1 },
      { question: "What oxygen level should be maintained?", questionChinese: "应该维持什么血氧水平？", options: ["Above 88%", "Above 90%", "Above 92%", "Above 95%"], correctIndex: 2 },
      { question: "When should the nurse call the doctor?", questionChinese: "什么情况下护士应该通知医生？", options: ["Temp above 38°C", "Temp above 39°C", "Temp above 40°C", "Any fever"], correctIndex: 1 },
    ]
  },
  {
    id: "le3", title: "Patient Describes Symptoms", titleChinese: "患者描述症状",
    scenario: "patient-symptoms", difficulty: "basic",
    transcript: "I've been having this pain in my chest for about two days now. It started suddenly while I was climbing stairs. The pain feels like someone is pressing on my chest. It gets worse when I take a deep breath or when I walk. I also feel short of breath, especially at night. I've been coughing up some white phlegm. I don't have a fever, but I've been feeling very tired. I take medication for high blood pressure. My father had a heart attack when he was 60.",
    transcriptChinese: "我胸口疼了大约两天了。是爬楼梯时突然开始的。感觉像有人在压我的胸口。深呼吸或走路时加重。我还感觉气短，特别是晚上。我一直在咳白色的痰。没有发烧，但是感觉非常疲劳。我在吃高血压的药。我父亲60岁时心脏病发作过。",
    questions: [
      { question: "How long has the patient had chest pain?", questionChinese: "患者胸痛持续了多久？", options: ["One day", "Two days", "One week", "Two weeks"], correctIndex: 1 },
      { question: "What makes the pain worse?", questionChinese: "什么会加重疼痛？", options: ["Eating", "Sleeping", "Deep breathing", "Sitting"], correctIndex: 2 },
      { question: "What family history is mentioned?", questionChinese: "提到了什么家族史？", options: ["Diabetes", "Heart attack", "Stroke", "Cancer"], correctIndex: 1 },
    ]
  },
  {
    id: "le4", title: "Phone Triage Call", titleChinese: "电话分诊",
    scenario: "phone-call", difficulty: "basic",
    transcript: "Hello, this is the nurse hotline. How can I help you? ... Okay, your child has had a fever of 39 degrees for two days. Is the child eating and drinking normally? ... Not much appetite, but drinking some water. Has the child had any vomiting or diarrhea? ... No vomiting, but the stool is a bit loose. Any rash or difficulty breathing? ... No rash, no breathing problems. Is the child alert and responsive? ... Yes, just fussy and wanting to be held. Okay, continue giving acetaminophen every 6 hours for the fever. Push fluids. If the fever goes above 40 degrees, the child stops drinking, or you notice a rash, please bring the child to the emergency room immediately.",
    transcriptChinese: "你好，这是护士热线。有什么可以帮您的？...好的，您的孩子发烧39度已经两天了。孩子吃喝正常吗？...食欲不太好，但在喝一些水。孩子有呕吐或腹泻吗？...没有呕吐，但大便有点稀。有皮疹或呼吸困难吗？...没有皮疹，没有呼吸问题。孩子反应灵敏吗？...是的，就是烦躁想要抱。好的，继续每6小时给对乙酰氨基酚退烧。多给水喝。如果体温超过40度、孩子不肯喝水或出现皮疹，请立即带孩子去急诊室。",
    questions: [
      { question: "How high is the child's fever?", questionChinese: "孩子的体温是多少？", options: ["38°C", "38.5°C", "39°C", "40°C"], correctIndex: 2 },
      { question: "How often should acetaminophen be given?", questionChinese: "多久给一次对乙酰氨基酚？", options: ["Every 4 hours", "Every 6 hours", "Every 8 hours", "Every 12 hours"], correctIndex: 1 },
      { question: "When should the parent go to the ER?", questionChinese: "什么情况下应该去急诊？", options: ["Fever above 39°C", "Fever above 40°C", "Any vomiting", "Child is fussy"], correctIndex: 1 },
    ]
  },
  {
    id: "le5", title: "Hospital Announcement: Code Blue", titleChinese: "医院广播：紧急呼叫",
    scenario: "announcement", difficulty: "basic",
    transcript: "Attention all staff. Code Blue, ICU Room 415. Code Blue, ICU Room 415. Rapid Response Team to ICU Room 415 immediately. I repeat: Code Blue, ICU Room 415. All available personnel, please respond.",
    transcriptChinese: "请注意所有工作人员。蓝色代码，ICU 415房间。蓝色代码，ICU 415房间。快速反应团队请立即到ICU 415房间。重复：蓝色代码，ICU 415房间。所有可用人员请响应。",
    questions: [
      { question: "What type of emergency is this?", questionChinese: "这是什么类型的紧急情况？", options: ["Fire", "Code Blue (cardiac arrest)", "Code Red (fire)", "Code Pink (infant abduction)"], correctIndex: 1 },
      { question: "Where is the emergency?", questionChinese: "紧急情况在哪里？", options: ["ER Room 415", "ICU Room 415", "Ward Room 415", "OR Room 415"], correctIndex: 1 },
      { question: "Who is being called?", questionChinese: "在呼叫谁？", options: ["Only doctors", "Rapid Response Team", "Security", "Maintenance"], correctIndex: 1 },
    ]
  },
  {
    id: "le6", title: "Nurse Handoff: Diabetic Patient", titleChinese: "护士交班：糖尿病患者",
    scenario: "handoff", difficulty: "intermediate",
    transcript: "Room 508, Mrs. Lee, 72-year-old female with Type 2 diabetes, admitted for uncontrolled blood sugars. She's on an insulin sliding scale, checking glucose AC and HS. Her morning fasting sugar was 210; we gave 6 units of regular insulin. Her A1C came back at 9.8%. She's been educated on carb counting. She's also on metformin 1000 mg BID. She has a history of diabetic neuropathy in both feet. Check her feet every shift. She's ambulatory with a walker. Fall risk is high due to neuropathy. Diet is 1800 calorie ADA diet.",
    transcriptChinese: "508房间，李女士，72岁女性，2型糖尿病，因血糖控制不佳入院。使用胰岛素滑动量表，餐前和睡前测血糖。今早空腹血糖210，给了6单位常规胰岛素。糖化血红蛋白9.8%。已进行碳水化合物计数教育。同时服用二甲双胍1000毫克每日两次。有双足糖尿病神经病变病史。每班检查她的脚。可以使用助行器行走。因神经病变跌倒风险高。饮食为1800卡路里ADA饮食。",
    questions: [
      { question: "What was her fasting blood sugar?", questionChinese: "她的空腹血糖是多少？", options: ["110", "150", "210", "310"], correctIndex: 2 },
      { question: "What is her A1C level?", questionChinese: "她的糖化血红蛋白是多少？", options: ["7.8%", "8.8%", "9.8%", "10.8%"], correctIndex: 2 },
      { question: "Why is she a fall risk?", questionChinese: "为什么她有跌倒风险？", options: ["Age", "Diabetic neuropathy", "Medication side effects", "Visual impairment"], correctIndex: 1 },
    ]
  },
  {
    id: "le7", title: "Patient Describes Allergic Reaction", titleChinese: "患者描述过敏反应",
    scenario: "patient-symptoms", difficulty: "intermediate",
    transcript: "About 20 minutes after I took the antibiotic, I started feeling itchy all over my body. Then I noticed my lips were swelling and I felt my throat getting tight. I was having trouble breathing. My face turned red and I felt dizzy. My husband gave me my EpiPen and called 911. By the time the ambulance arrived, I was feeling a bit better but still had hives on my arms and chest.",
    transcriptChinese: "服用抗生素大约20分钟后，我开始全身发痒。然后我发现嘴唇在肿胀，感觉喉咙发紧。呼吸困难。脸变红了，感觉头晕。我丈夫给我打了EpiPen并拨打了911。救护车到达时，我感觉好了一些，但手臂和胸部仍有荨麻疹。",
    questions: [
      { question: "What triggered the reaction?", questionChinese: "什么引发了反应？", options: ["Food", "Antibiotic", "Bee sting", "Latex"], correctIndex: 1 },
      { question: "What symptom suggests anaphylaxis?", questionChinese: "什么症状提示过敏性休克？", options: ["Headache", "Throat tightness", "Stomach pain", "Back pain"], correctIndex: 1 },
      { question: "What emergency treatment was given?", questionChinese: "给予了什么紧急治疗？", options: ["Antihistamine", "EpiPen", "CPR", "Oxygen"], correctIndex: 1 },
    ]
  },
  {
    id: "le8", title: "Doctor Orders: Post-Cardiac Catheterization", titleChinese: "医嘱：心导管术后",
    scenario: "doctor-orders", difficulty: "advanced",
    transcript: "This is Dr. Park with post-cath orders for Mr. Davis in room 612. He had a stent placed in the LAD. Keep the right groin site flat for 4 hours. Check the groin site and pedal pulses every 15 minutes for the first hour, then every 30 minutes for 2 hours, then hourly for 4 hours. Start aspirin 325 mg daily and clopidogrel 75 mg daily. Resume his home medications including metoprolol and lisinopril. Cardiac diet. IV fluids at 150 mL per hour for 4 hours to flush the contrast dye. Monitor BUN and creatinine in the morning. Call me for any bleeding, loss of pulse, or chest pain.",
    transcriptChinese: "我是Park医生，612房间Davis先生的心导管术后医嘱。他在左前降支放置了支架。右侧腹股沟部位平卧4小时。第一小时每15分钟检查腹股沟部位和足背脉搏，之后2小时每30分钟一次，再之后4小时每小时一次。开始阿司匹林325毫克每日和氯吡格雷75毫克每日。恢复他的居家用药包括美托洛尔和赖诺普利。心脏饮食。静脉液体150毫升/小时输4小时以冲洗造影剂。早上监测血尿素氮和肌酐。如有出血、脉搏消失或胸痛请通知我。",
    questions: [
      { question: "How long should the patient stay flat?", questionChinese: "患者应该平卧多长时间？", options: ["2 hours", "4 hours", "6 hours", "8 hours"], correctIndex: 1 },
      { question: "How often should pulses be checked in the first hour?", questionChinese: "第一小时多久检查一次脉搏？", options: ["Every 5 minutes", "Every 15 minutes", "Every 30 minutes", "Every hour"], correctIndex: 1 },
      { question: "Why are IV fluids running at a higher rate?", questionChinese: "为什么静脉液体以较高速率输注？", options: ["Dehydration", "Blood loss", "Flush contrast dye", "Medication delivery"], correctIndex: 2 },
    ]
  },
  {
    id: "le9", title: "Phone Call: Lab Critical Value", titleChinese: "电话：化验危急值",
    scenario: "phone-call", difficulty: "intermediate",
    transcript: "Hello, this is the lab calling with a critical value for patient Mary Smith, medical record number 4-5-6-7-8-9. Her potassium level is 6.2. That's 6-point-2 milliequivalents per liter. The specimen was drawn at 14:30 today. Can you please read back the value? ... Correct, potassium 6.2 for Mary Smith. Please notify the attending physician immediately. This is a critical value that requires urgent attention.",
    transcriptChinese: "你好，这是化验室打来的，关于患者Mary Smith的危急值，病历号4-5-6-7-8-9。她的钾水平是6.2。即6.2毫当量/升。标本是今天14:30抽取的。请您回读一下这个值好吗？...正确，Mary Smith的钾是6.2。请立即通知主治医生。这是需要紧急处理的危急值。",
    questions: [
      { question: "What is the critical lab value?", questionChinese: "危急化验值是什么？", options: ["Sodium 125", "Potassium 6.2", "Glucose 400", "Hemoglobin 6.0"], correctIndex: 1 },
      { question: "What should the nurse do first?", questionChinese: "护士首先应该做什么？", options: ["Recheck the lab", "Notify the attending physician", "Give medication", "Call the family"], correctIndex: 1 },
      { question: "When was the specimen drawn?", questionChinese: "标本什么时候抽取的？", options: ["12:30", "13:30", "14:30", "15:30"], correctIndex: 2 },
    ]
  },
  {
    id: "le10", title: "Hospital Announcement: Fire Drill", titleChinese: "医院广播：消防演习",
    scenario: "announcement", difficulty: "basic",
    transcript: "Attention all staff and visitors. This is a fire drill. I repeat, this is only a drill. Please follow RACE protocol: Rescue anyone in immediate danger, Activate the fire alarm, Contain the fire by closing doors, and Evacuate if necessary. All staff, please report to your designated assembly points. Remember to use stairs, not elevators. The drill will last approximately 15 minutes. Thank you for your cooperation.",
    transcriptChinese: "请注意所有工作人员和访客。这是消防演习。重复，这只是演习。请遵循RACE方案：救援处于直接危险中的人员，启动火灾警报，关闭门窗控制火势，必要时撤离。所有工作人员请到指定集合点报到。记住使用楼梯，不要使用电梯。演习将持续大约15分钟。感谢您的配合。",
    questions: [
      { question: "What does R in RACE stand for?", questionChinese: "RACE中的R代表什么？", options: ["Run", "Rescue", "Report", "Respond"], correctIndex: 1 },
      { question: "What should NOT be used during a fire?", questionChinese: "火灾时不应该使用什么？", options: ["Stairs", "Fire extinguisher", "Elevators", "Fire alarms"], correctIndex: 2 },
      { question: "How long will the drill last?", questionChinese: "演习持续多长时间？", options: ["5 minutes", "10 minutes", "15 minutes", "30 minutes"], correctIndex: 2 },
    ]
  },
  {
    id: "le11", title: "Nurse Handoff: Stroke Patient", titleChinese: "护士交班：中风患者",
    scenario: "handoff", difficulty: "advanced",
    transcript: "Room 220, Mr. Garcia, 58-year-old male admitted with acute ischemic stroke. He received tPA at 10:15 this morning. Currently, neuro checks every hour. His NIH Stroke Scale is 8. He has right-sided weakness—arm drift present, leg can lift against gravity. Speech is slightly slurred. He's on aspirin 81 mg daily, started 24 hours after tPA. Blood pressure parameters: keep systolic below 180 and diastolic below 105. He's on a dysphagia diet—pureed foods and nectar-thick liquids. Speech therapy evaluated him today. PT and OT consults are in. Fall risk is high. Bed alarm is on.",
    transcriptChinese: "220房间，Garcia先生，58岁男性，急性缺血性中风入院。今天上午10:15接受了tPA溶栓治疗。目前每小时进行神经系统检查。NIH中风量表评分为8分。右侧肢体无力——手臂上举有漂移，下肢可以抗重力抬起。言语略有含糊。阿司匹林81毫克每日，tPA后24小时开始。血压参数：收缩压保持在180以下，舒张压105以下。吞咽困难饮食——泥状食物和花蜜稠度液体。今天言语治疗师评估了他。物理治疗和职业治疗会诊已下达。跌倒风险高。床铺警报已开启。",
    questions: [
      { question: "What treatment was given for the stroke?", questionChinese: "中风给予了什么治疗？", options: ["Surgery", "tPA", "Aspirin only", "Blood transfusion"], correctIndex: 1 },
      { question: "What is the systolic BP limit?", questionChinese: "收缩压上限是多少？", options: ["140", "160", "180", "200"], correctIndex: 2 },
      { question: "What type of diet is the patient on?", questionChinese: "患者是什么饮食？", options: ["Regular", "Clear liquid", "Dysphagia diet", "NPO"], correctIndex: 2 },
    ]
  },
  {
    id: "le12", title: "Patient Describes Chest Pain", titleChinese: "患者描述胸痛",
    scenario: "patient-symptoms", difficulty: "intermediate",
    transcript: "The pain started about an hour ago. It feels like a heavy weight on my chest, right in the center. The pain goes down my left arm and up into my jaw. I feel nauseous and sweaty. I took a nitroglycerin tablet under my tongue about 15 minutes ago, but the pain hasn't gone away. I also feel short of breath. I have a history of heart disease and had a stent placed two years ago. I take aspirin, metoprolol, and atorvastatin.",
    transcriptChinese: "疼痛大约一小时前开始的。感觉像有重物压在胸口正中间。疼痛放射到左臂和下颌。我感觉恶心和出汗。大约15分钟前舌下含了一片硝酸甘油，但疼痛没有消失。我还感觉气短。我有心脏病病史，两年前放过支架。我在服用阿司匹林、美托洛尔和阿托伐他汀。",
    questions: [
      { question: "Where does the pain radiate?", questionChinese: "疼痛放射到哪里？", options: ["Right arm and back", "Left arm and jaw", "Both arms", "Stomach"], correctIndex: 1 },
      { question: "Did nitroglycerin help?", questionChinese: "硝酸甘油有效吗？", options: ["Yes, completely", "Yes, partially", "No", "Not taken yet"], correctIndex: 2 },
      { question: "What cardiac history does the patient have?", questionChinese: "患者有什么心脏病史？", options: ["Bypass surgery", "Stent placement", "Pacemaker", "Valve replacement"], correctIndex: 1 },
    ]
  },
  {
    id: "le13", title: "Doctor Orders: Insulin Management", titleChinese: "医嘱：胰岛素管理",
    scenario: "doctor-orders", difficulty: "advanced",
    transcript: "This is Dr. Patel. For Mrs. Kim in room 405, I want to change her insulin regimen. Discontinue the regular insulin sliding scale. Start Lantus 20 units subcutaneous at bedtime. Also start Humalog 4 units before each meal. Continue checking blood glucose before meals and at bedtime. If blood sugar is below 70, give 15 grams of fast-acting carbs and recheck in 15 minutes. If above 300, check urine for ketones and call me. Make sure she understands how to use the insulin pen before discharge.",
    transcriptChinese: "我是Patel医生。405房间的Kim女士，我要更改她的胰岛素方案。停用常规胰岛素滑动量表。开始甘精胰岛素20单位睡前皮下注射。同时开始赖脯胰岛素每餐前4单位。继续餐前和睡前监测血糖。如果血糖低于70，给15克速效碳水化合物，15分钟后复查。如果高于300，检查尿酮体并通知我。确保她出院前了解如何使用胰岛素笔。",
    questions: [
      { question: "What is the Lantus dose?", questionChinese: "甘精胰岛素剂量是多少？", options: ["10 units", "15 units", "20 units", "25 units"], correctIndex: 2 },
      { question: "What should be done for blood sugar below 70?", questionChinese: "血糖低于70应该怎么办？", options: ["Give insulin", "Give 15g fast-acting carbs", "Call the doctor", "Skip the meal"], correctIndex: 1 },
      { question: "When should the doctor be called?", questionChinese: "什么时候应该通知医生？", options: ["Blood sugar above 200", "Blood sugar above 250", "Blood sugar above 300", "Blood sugar above 400"], correctIndex: 2 },
    ]
  },
  {
    id: "le14", title: "Phone Call: Post-Discharge Follow-up", titleChinese: "电话：出院后随访",
    scenario: "phone-call", difficulty: "basic",
    transcript: "Hi Mr. Brown, this is Nurse Jennifer calling from Memorial Hospital. I'm calling to check on you after your discharge yesterday. How are you feeling today? ... Good. Are you taking your medications as prescribed? ... And your blood pressure medication, are you taking that in the morning? ... Great. Have you had any pain or swelling at your surgical site? ... A little redness is normal, but if it spreads or you notice any drainage, please come back to see us. Do you have your follow-up appointment scheduled? ... Good, we'll see you next Thursday. Don't forget to keep the incision clean and dry. Call us if you have any concerns.",
    transcriptChinese: "你好Brown先生，我是纪念医院的Jennifer护士。我打电话来看看你昨天出院后的情况。今天感觉怎么样？...很好。你在按医嘱服药吗？...你的降压药早上在吃吗？...太好了。手术部位有疼痛或肿胀吗？...轻微发红是正常的，但如果扩大或你注意到有分泌物，请回来看看。你预约了随访吗？...好的，下周四见。别忘了保持切口清洁干燥。有任何问题请联系我们。",
    questions: [
      { question: "When was the patient discharged?", questionChinese: "患者什么时候出院的？", options: ["Today", "Yesterday", "Two days ago", "Last week"], correctIndex: 1 },
      { question: "When is the follow-up appointment?", questionChinese: "随访预约是什么时候？", options: ["Next Monday", "Next Wednesday", "Next Thursday", "Next Friday"], correctIndex: 2 },
      { question: "What should the patient watch for?", questionChinese: "患者应该注意什么？", options: ["Redness spreading or drainage", "Mild redness", "Slight bruising", "Normal healing"], correctIndex: 0 },
    ]
  },
  {
    id: "le15", title: "Hospital Announcement: Visiting Hours", titleChinese: "医院广播：探视时间",
    scenario: "announcement", difficulty: "basic",
    transcript: "Good evening. This is a reminder that visiting hours will end in 30 minutes, at 8:00 PM. We ask all visitors to please begin saying goodbye to patients. For the safety and comfort of our patients, only one overnight visitor is allowed per room. All other visitors must exit through the main lobby. Please remember to use hand sanitizer when entering and leaving patient rooms. Visiting hours resume tomorrow morning at 10:00 AM. Thank you, and have a good evening.",
    transcriptChinese: "晚上好。提醒大家探视时间还有30分钟结束，即晚上8点。请所有访客开始向患者告别。为了患者的安全和舒适，每个房间只允许一位过夜陪护人员。其他访客请从大厅出口离开。请记得进出病房时使用手消毒液。明天上午10点恢复探视。谢谢，祝大家晚安。",
    questions: [
      { question: "What time do visiting hours end?", questionChinese: "探视时间几点结束？", options: ["7:00 PM", "7:30 PM", "8:00 PM", "9:00 PM"], correctIndex: 2 },
      { question: "How many overnight visitors are allowed?", questionChinese: "允许几位过夜陪护？", options: ["None", "One", "Two", "Three"], correctIndex: 1 },
      { question: "When do visiting hours resume?", questionChinese: "探视时间什么时候恢复？", options: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"], correctIndex: 2 },
    ]
  },
];
