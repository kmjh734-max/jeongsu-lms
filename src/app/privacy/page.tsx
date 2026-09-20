import type { Metadata } from "next";
import { Clause, LegalPage } from "@/components/site/LegalPage";
import { BUSINESS_INFO, REFUND_POLICY_EFFECTIVE_DATE } from "@/lib/site/business-info";

export const metadata: Metadata = { title: "개인정보처리방침 | EngCore" };

const TH = "border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold";
const TD = "border border-slate-200 px-3 py-2 align-top";

export default function PrivacyPage() {
  const b = BUSINESS_INFO;
  const contact = [b.email && `이메일 ${b.email}`, b.phone && `전화 ${b.phone}`].filter(Boolean).join(" · ");
  return (
    <LegalPage title="개인정보처리방침" effective={REFUND_POLICY_EFFECTIVE_DATE}>
      <p>
        {b.name}(이하 &quot;회사&quot;)는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을
        빠르게 처리하기 위해 다음과 같이 개인정보처리방침을 둡니다.
      </p>

      <Clause no={1} title="처리하는 개인정보와 목적">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr>
                <th className={TH}>구분</th>
                <th className={TH}>항목</th>
                <th className={TH}>목적</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>학원 회원(원장·관리자)</td>
                <td className={TD}>이름, 아이디, 이메일, 비밀번호, 학원명, 연락처</td>
                <td className={TD}>가입·본인 확인, 서비스 제공, 결제·환불, 공지·문의 응대</td>
              </tr>
              <tr>
                <td className={TD}>강사·학생 계정</td>
                <td className={TD}>이름, 아이디, 비밀번호, 소속 반</td>
                <td className={TD}>학원이 만든 계정으로 수업·과제 제공</td>
              </tr>
              <tr>
                <td className={TD}>학습 기록</td>
                <td className={TD}>단어·듣기 학습 결과, 시험 점수, 과제 수행 기록</td>
                <td className={TD}>학습 관리, 학습 리포트 작성</td>
              </tr>
              <tr>
                <td className={TD}>학생부 분석(학원이 이용하는 경우)</td>
                <td className={TD}>학원이 올린 학생부 내용, 학교명</td>
                <td className={TD}>학원이 요청한 학생부 분석 보고서 작성</td>
              </tr>
              <tr>
                <td className={TD}>결제</td>
                <td className={TD}>주문번호, 결제 금액, 결제 일시, 결제 수단 종류, 영수증 정보</td>
                <td className={TD}>크레딧 충전, 환불, 세금계산 등 법정 의무 이행</td>
              </tr>
              <tr>
                <td className={TD}>자동 수집</td>
                <td className={TD}>접속 기록, IP 주소, 쿠키, 브라우저 정보</td>
                <td className={TD}>로그인 유지, 보안·부정 이용 방지, 오류 확인</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>카드번호 등 결제수단 정보는 결제대행사가 처리하며 회사는 보관하지 않습니다.</p>
      </Clause>

      <Clause no={2} title="보유 기간과 파기">
        <ol className="list-decimal space-y-1 pl-5">
          <li>개인정보는 이용계약이 끝나면(회원 탈퇴·계정 삭제) 지체 없이 파기합니다. 학원이 삭제한 강사·학생 계정의 정보도 같습니다.</li>
          <li>다만 관계 법령에 따라 다음 정보는 정해진 기간 동안 보관한 뒤 파기합니다.
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              <li>계약·청약철회, 대금 결제·재화 공급에 관한 기록: 5년 (전자상거래법)</li>
              <li>소비자 불만·분쟁 처리에 관한 기록: 3년 (전자상거래법)</li>
              <li>접속 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </li>
          <li>전자 파일은 복구할 수 없는 방법으로 지우고, 종이 문서는 분쇄하거나 태웁니다.</li>
        </ol>
      </Clause>

      <Clause no={3} title="처리 위탁과 국외 이전">
        <p>회사는 서비스 제공을 위해 다음 업체에 개인정보 처리를 맡깁니다. 일부는 국외에서 처리됩니다.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className={TH}>받는 자(국가)</th>
                <th className={TH}>맡기는 일</th>
                <th className={TH}>이전되는 항목</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>토스페이먼츠(주) (대한민국)</td>
                <td className={TD}>결제 처리</td>
                <td className={TD}>주문번호, 결제 금액, 결제 정보</td>
              </tr>
              <tr>
                <td className={TD}>Supabase, Inc. (미국)</td>
                <td className={TD}>데이터 저장, 로그인 처리</td>
                <td className={TD}>제1조의 계정·학습·결제 기록</td>
              </tr>
              <tr>
                <td className={TD}>Vercel Inc. (미국)</td>
                <td className={TD}>웹 서비스 운영</td>
                <td className={TD}>접속 기록</td>
              </tr>
              <tr>
                <td className={TD}>OpenAI, L.L.C. (미국)</td>
                <td className={TD}>자료 생성·분석 처리</td>
                <td className={TD}>이용자가 넣은 지문·문장, 학생부 분석을 요청한 경우 그 학생부 내용</td>
              </tr>
              <tr>
                <td className={TD}>Microsoft Corporation (미국)</td>
                <td className={TD}>듣기 음성 만들기</td>
                <td className={TD}>듣기 대본 (개인정보 없음)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          국외 이전은 서비스 이용 시 네트워크를 통해 이루어지며, 위 업체들은 계약에 따라 맡긴 일 밖으로 정보를 쓰지
          않습니다. 이용자는 국외 이전을 거부할 수 있으나, 이 경우 해당 기능을 이용할 수 없습니다.
        </p>
      </Clause>

      <Clause no={4} title="제3자 제공">
        <p>회사는 이용자의 동의가 있거나 법령에 특별한 규정이 있는 경우를 빼고는 개인정보를 제3자에게 제공하지 않습니다.</p>
      </Clause>

      <Clause no={5} title="만 14세 미만 아동">
        <p>
          학생 계정은 학원이 수업을 위해 만들며, 학원은 만 14세 미만 학생의 계정을 만들 때 법정대리인의 동의를 받아야
          합니다. 회사는 학원이 동의를 받았다는 전제에서 학생 정보를 처리합니다.
        </p>
      </Clause>

      <Clause no={6} title="이용자의 권리">
        <ol className="list-decimal space-y-1 pl-5">
          <li>이용자는 언제든 자신의 개인정보를 열람·정정·삭제하거나 처리 정지를 요구할 수 있습니다.</li>
          <li>강사·학생의 요구는 소속 학원을 통해서도 할 수 있으며, 회사는 지체 없이 조치합니다.</li>
        </ol>
      </Clause>

      <Clause no={7} title="안전성 확보 조치">
        <ul className="list-disc space-y-1 pl-5">
          <li>비밀번호는 암호화하여 저장하고, 모든 통신은 암호화(HTTPS)합니다.</li>
          <li>학원별로 데이터를 나누어, 다른 학원의 정보에 접근할 수 없게 합니다.</li>
          <li>개인정보를 다루는 사람을 최소한으로 두고, 접근 기록을 관리합니다.</li>
        </ul>
      </Clause>

      <Clause no={8} title="쿠키">
        <p>
          회사는 로그인 유지와 학원 구분을 위해 쿠키를 씁니다. 브라우저 설정에서 쿠키를 막을 수 있으나, 이 경우 로그인이
          필요한 기능을 쓸 수 없습니다.
        </p>
      </Clause>

      <Clause no={9} title="개인정보 보호책임자">
        <p>
          개인정보 보호책임자: {b.representative || "대표자"}
          {contact ? ` (${contact})` : ""}
        </p>
        <p>
          개인정보 침해에 대한 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 118), 개인정보분쟁조정위원회
          (www.kopico.go.kr, 1833-6972)에도 할 수 있습니다.
        </p>
      </Clause>

      <Clause title="부칙">
        <p>이 방침은 {REFUND_POLICY_EFFECTIVE_DATE}부터 시행합니다.</p>
      </Clause>
    </LegalPage>
  );
}
