package org.capstone.maru.config;

import com.p6spy.engine.logging.Category;
import com.p6spy.engine.spy.appender.MessageFormattingStrategy;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.hibernate.engine.jdbc.internal.FormatStyle;

public class P6spyPrettySqlFormatter implements MessageFormattingStrategy {

    @Override
    public String formatMessage(int connectionId, String now, long elapsed, String category,
        String prepared, String sql,
        String url) {
        sql = formatSQL(category, sql);
        Date currentDate = new Date();

        SimpleDateFormat dateFormat = new SimpleDateFormat("yy.MM.dd'T'HH:mm:ss");

        return dateFormat.format(currentDate) + " | " + "OperationTime: " + elapsed + "ms" + sql;
    }

    private String formatSQL(String category, String sql) {
        if (sql == null || sql.trim().equals("")) {
            return sql;
        }

        if (Category.STATEMENT.getName().equals(category)) {
            String tmpsql = sql.trim().toLowerCase(Locale.ROOT);
            if (tmpsql.startsWith("create") || tmpsql.startsWith("alter") || tmpsql.startsWith(
                "comment")) {
                sql = FormatStyle.DDL.getFormatter().format(sql);
            } else {
                sql = FormatStyle.BASIC.getFormatter().format(sql);
            }
            sql = "|\nleejh7 FormatSql(P6Spy sql, Hibernate format): " + sql;
        }

        return sql;
    }
}
