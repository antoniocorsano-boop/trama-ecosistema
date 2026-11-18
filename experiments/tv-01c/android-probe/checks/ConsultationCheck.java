package it.trama.voiceprobe;
public final class ConsultationCheck {
 private static void require(boolean value){if(!value)throw new AssertionError();}
 public static void main(String[] args){
  String[] phrases={"mostra l’orario","apri il calendario","mostrami gli impegni","mostrami le classi","cerca un documento","prepara una lezione"};
  String[] paths={"/orario","/calendario","/planner","/classi","/knowledge","/progetta"};
  for(int i=0;i<phrases.length;i++){
   Consultation c=Consultation.resolve(phrases[i]);require(c!=null);require(c.url().equals("https://docente-os-2026-27-beta.onrender.com"+paths[i]));
  }
  for(String s:new String[]{"non aprire il calendario","apri calendario e mostra orario","apri https://example.org","apri il calendario?x=2","registra un voto","elimina un documento","cerca un laboratorio","",null,"apri calendario [unk]"})require(Consultation.resolve(s)==null);
  require(Consultation.resolve(" APRI   IL CALENDARIO. ")==Consultation.CALENDAR);
  for(String phrase:new String[]{"mostra l orario","mostra l' orario","mostrami l orario","apri l orario"})require(Consultation.resolve(phrase)==Consultation.TIMETABLE);
  require(Consultation.resolve("mostra calendario")==Consultation.CALENDAR);
  require(Consultation.resolve("non mostra l orario")==null);
  require(Consultation.resolve("mostra l orario e apri il calendario")==null);
  require(Consultation.resolve("x".repeat(181))==null);
  System.out.println("Consultation: fixed destinations and rejected unsafe/ambiguous requests PASS");
 }
}
