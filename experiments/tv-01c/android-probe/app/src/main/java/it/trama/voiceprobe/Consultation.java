package it.trama.voiceprobe;

import java.text.Normalizer;
import java.util.Locale;

/** Bounded navigation only. No transcript is ever part of a destination. */
public enum Consultation {
 TIMETABLE("Orario","/orario"),
 CALENDAR("Calendario","/calendario"),
 TODAY("Oggi","/planner"),
 CLASSES("Classi","/classi"),
 KNOWLEDGE("Materiali e fonti","/knowledge"),
 DESIGN("Progetta","/progetta");

 private static final String ORIGIN="https://docente-os-2026-27-beta.onrender.com";
 public final String label;
 private final String path;
 Consultation(String label,String path){this.label=label;this.path=path;}
 public String url(){return ORIGIN+path;}
 static String normalize(String text){
  if(text==null||text.length()>180)return "";
  return Normalizer.normalize(text,Normalizer.Form.NFC).toLowerCase(Locale.ITALIAN).replace('’','\'').trim().replaceAll("\\s+"," ").replaceAll("[.!?]+$","").trim();
 }
 public static Consultation resolve(String text){
  switch(normalize(text)){
   case "mostra l'orario":case "mostra orario":case "mostrami l'orario":case "apri l'orario":case "apri orario":return TIMETABLE;
   case "apri il calendario":case "apri calendario":case "mostra il calendario":case "mostrami il calendario":return CALENDAR;
   case "mostrami gli impegni":case "mostra gli impegni":case "apri oggi":case "mostra gli impegni di oggi":return TODAY;
   case "mostrami le classi":case "mostra le classi":case "apri le classi":case "apri classi":return CLASSES;
   case "mostra i materiali":case "apri i materiali":case "cerca un documento":case "mostrami i materiali":return KNOWLEDGE;
   case "apri la progettazione":case "prepara una lezione":case "apri progetta":return DESIGN;
   default:return null;
  }
 }
}
