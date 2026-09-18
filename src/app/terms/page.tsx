import type { Metadata } from "next";
import Link from "next/link";
import { Clause, LegalPage } from "@/components/site/LegalPage";
import { BUSINESS_INFO, REFUND_POLICY_EFFECTIVE_DATE } from "@/lib/site/business-info";

export const metadata: Metadata = { title: "이용약관 | EngCore" };

export default function TermsPage() {
  const name = BUSINESS_INFO.name;
  return (
    <LegalPage title="이용약관" effective={REFUND_POLICY_EFFECTIVE_DATE}>
      <Clause no={1} title="목적">
        <p>
          이 약관은 {name}(이하 &quot;회사&quot;)가 제공하는 EngCore 서비스(이하 &quot;서비스&quot;)의 이용 조건과 절차,
          회사와 이용자의 권리·의무 및 책임 사항을 정합니다.
        </p>
      </Clause>

      <Clause no={2} title="정의">
        <ol className="list-decimal space-y-1 pl-5">
          <li>&quot;서비스&quot;란 회사가 제공하는 영어학원 운영 플랫폼으로, 수업자료·시험지 제작, 듣기평가, 단어학습, 학습 리포트, 반·학생 관리 기능을 말합니다.</li>
          <li>&quot;이용자&quot;란 이 약관에 따라 서비스를 이용하는 학원(원장·관리자)과, 학원이 만든 계정으로 서비스를 이용하는 강사·학생을 말합니다.</li>
          <li>&quot;학원 회원&quot;이란 회원가입으로 이용계약을 맺은 학원을 말하며, 학원의 관리자 계정이 학원을 대표합니다.</li>
          <li>&quot;크레딧&quot;이란 서비스의 유료 기능을 이용하기 위해 학원 회원이 충전하는 선불 이용권을 말합니다.</li>
        </ol>
      </Clause>

      <Clause no={3} title="약관의 게시와 변경">
        <ol className="list-decimal space-y-1 pl-5">
          <li>회사는 이 약관을 서비스 첫 화면 하단에 연결하여 누구나 볼 수 있게 합니다.</li>
          <li>회사는 관계 법령을 어기지 않는 범위에서 약관을 바꿀 수 있으며, 바꿀 때에는 시행일 7일 전(이용자에게 불리한 경우 30일 전)부터 서비스 안에 알립니다.</li>
          <li>이용자가 바뀐 약관에 동의하지 않으면 이용계약을 해지할 수 있습니다.</li>
        </ol>
      </Clause>

      <Clause no={4} title="이용계약의 성립">
        <ol className="list-decimal space-y-1 pl-5">
          <li>이용계약은 학원 회원이 되려는 사람이 이 약관과 개인정보처리방침에 동의하고 가입을 신청한 뒤, 회사가 이를 승낙하면 성립합니다.</li>
          <li>회사는 다른 사람의 정보를 쓰거나 거짓 정보를 적은 신청, 법령이나 이 약관을 어길 목적의 신청은 승낙하지 않거나 나중에 계약을 해지할 수 있습니다.</li>
          <li>강사·학생 계정은 학원 회원이 만들며, 학원 회원은 자기 학원 계정의 이용을 관리할 책임이 있습니다.</li>
        </ol>
      </Clause>

      <Clause no={5} title="서비스의 제공">
        <ol className="list-decimal space-y-1 pl-5">
          <li>회사는 연중무휴, 하루 24시간 서비스를 제공하는 것을 원칙으로 합니다.</li>
          <li>설비 점검·교체, 통신 장애, 외부 서비스 장애 등 부득이한 경우 서비스를 잠시 멈출 수 있으며, 미리 알릴 수 있는 경우에는 미리 알립니다.</li>
          <li>회사는 서비스의 기능을 더하거나 바꿀 수 있습니다.</li>
        </ol>
      </Clause>

      <Clause no={6} title="크레딧과 결제">
        <ol className="list-decimal space-y-1 pl-5">
          <li>학원 회원은 회사가 정한 충전 상품을 결제하여 크레딧을 충전하고, 유료 기능을 쓸 때 서비스 화면에 표시된 크레딧이 차감됩니다.</li>
          <li>충전 상품과 기능별 크레딧은 <Link className="underline" href="/pricing">요금 안내</Link>에 게시합니다. 회사가 요금을 바꿀 때에는 미리 알리며, 이미 충전한 크레딧의 가치는 바뀌지 않습니다.</li>
          <li>결제는 회사가 정한 결제대행사를 통해 처리합니다.</li>
          <li>청약철회와 환불은 <Link className="underline" href="/refund-policy">환불 기준</Link>에 따릅니다.</li>
        </ol>
      </Clause>

      <Clause no={7} title="이용자가 넣은 자료와 만든 자료">
        <ol className="list-decimal space-y-1 pl-5">
          <li>이용자가 서비스에 넣는 지문·문항·학생 정보 등(이하 &quot;입력 자료&quot;)의 권리와 책임은 이용자에게 있습니다. 이용자는 자신이 이용할 권리가 있는 자료만 넣어야 합니다.</li>
          <li>이용자가 서비스로 만든 수업자료·시험지 등은 이용자가 자기 학원의 수업과 학생 지도에 자유롭게 쓸 수 있습니다.</li>
          <li>회사는 입력 자료를 서비스 제공과 개선 목적 밖에서 쓰지 않으며, 이용자의 동의 없이 제3자에게 공개하지 않습니다.</li>
        </ol>
      </Clause>

      <Clause no={8} title="이용자의 의무">
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>다른 사람의 계정을 쓰거나 계정을 다른 사람과 나눠 쓰는 행위</li>
          <li>다른 사람의 저작권 등 권리를 침해하는 자료를 넣거나 퍼뜨리는 행위</li>
          <li>서비스를 비정상적으로 이용하거나 운영을 방해하는 행위(자동화된 대량 요청 등)</li>
          <li>서비스로 만든 자료를 회사의 동의 없이 판매하거나 영리 목적으로 재배포하는 행위</li>
          <li>그 밖에 법령이나 이 약관을 어기는 행위</li>
        </ol>
      </Clause>

      <Clause no={9} title="회사의 의무">
        <ol className="list-decimal space-y-1 pl-5">
          <li>회사는 안정적으로 서비스를 제공하도록 노력하며, 장애가 생기면 지체 없이 고칩니다.</li>
          <li>회사는 이용자의 개인정보를 <Link className="underline" href="/privacy">개인정보처리방침</Link>에 따라 보호합니다.</li>
          <li>회사는 이용자의 정당한 의견이나 불만을 처리하고 그 결과를 알립니다.</li>
        </ol>
      </Clause>

      <Clause no={10} title="이용 제한과 계약 해지">
        <ol className="list-decimal space-y-1 pl-5">
          <li>이용자가 제8조를 어기면 회사는 경고, 일시 정지, 이용계약 해지의 순서로 이용을 제한할 수 있습니다. 다만 법령 위반이 분명한 경우에는 바로 해지할 수 있습니다.</li>
          <li>학원 회원은 언제든 이용계약을 해지할 수 있으며, 남은 유료 크레딧은 환불 기준에 따라 환불합니다.</li>
        </ol>
      </Clause>

      <Clause no={11} title="책임의 제한">
        <ol className="list-decimal space-y-1 pl-5">
          <li>회사는 천재지변, 이용자의 잘못, 회사가 통제할 수 없는 외부 서비스 장애로 생긴 손해에는 책임을 지지 않습니다. 다만 회사의 고의나 과실이 있으면 그렇지 않습니다.</li>
          <li>서비스가 만든 자료는 수업 준비를 돕기 위한 것이며, 이용자는 학생에게 내보내기 전에 내용을 확인할 책임이 있습니다.</li>
          <li>서비스 오류로 차감된 크레딧은 환불 기준 제6조에 따라 되돌립니다.</li>
        </ol>
      </Clause>

      <Clause no={12} title="분쟁 해결">
        <p>
          이 약관은 대한민국 법에 따르며, 서비스 이용으로 생긴 분쟁은 민사소송법이 정한 관할 법원에서 해결합니다.
        </p>
      </Clause>

      <Clause title="부칙">
        <p>이 약관은 {REFUND_POLICY_EFFECTIVE_DATE}부터 시행합니다.</p>
      </Clause>
    </LegalPage>
  );
}
